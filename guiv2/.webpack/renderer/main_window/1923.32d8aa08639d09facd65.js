"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[1923],{

/***/ 21923:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  UserManagementView: () => (/* binding */ UserManagementView),
  "default": () => (/* binding */ admin_UserManagementView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
// EXTERNAL MODULE: ./src/renderer/components/organisms/VirtualizedDataGrid.tsx
var VirtualizedDataGrid = __webpack_require__(59944);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Input.tsx
var Input = __webpack_require__(34766);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Select.tsx
var Select = __webpack_require__(1156);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Badge.tsx
var Badge = __webpack_require__(61315);
// EXTERNAL MODULE: ./src/renderer/store/useNotificationStore.ts
var useNotificationStore = __webpack_require__(79455);
// EXTERNAL MODULE: ./src/renderer/services/exportService.ts
var exportService = __webpack_require__(63338);
// EXTERNAL MODULE: ./src/renderer/lib/electron-api-fallback.ts
var electron_api_fallback = __webpack_require__(58350);
;// ./src/renderer/services/powerShellService.ts
/**
 * Renderer-side PowerShell Service
 *
 * Mirrors C# CsvDataServiceNew and LogicEngineService patterns with:
 * - Session-based caching with TTL (Time To Live)
 * - Automatic cache invalidation
 * - Progress reporting
 * - Cancellation support
 * - Fallback mechanisms
 * - Script and module execution
 *
 * This service acts as a client-side wrapper around the Electron IPC PowerShell execution.
 */

/**
 * PowerShell Service - Client-side wrapper for PowerShell execution
 *
 * Mirrors C# patterns from:
 * - GUI/Services/CsvDataServiceNew.cs
 * - GUI/Services/LogicEngineService.cs
 * - GUI/Services/PowerShellExecutor.cs
 */
class PowerShellService {
    cache = new Map();
    config;
    cacheCleanupInterval = null;
    progressCallbacks = new Map();
    outputCallbacks = new Map();
    constructor(config) {
        this.config = {
            defaultCacheTTL: 300000, // 5 minutes like C#
            enableCacheCleanup: true,
            cacheCleanupInterval: 60000, // 1 minute
            maxCacheSize: 100,
            ...config,
        };
        if (this.config.enableCacheCleanup) {
            this.startCacheCleanup();
        }
        // Setup IPC event listeners for progress and output
        this.setupEventListeners();
    }
    /**
     * Setup event listeners for PowerShell execution events
     * Mirrors C# event handling patterns
     */
    setupEventListeners() {
        const api = (0,electron_api_fallback/* getElectronAPI */.d)();
        if (!api)
            return;
        // Progress events
        if (api.onProgress) {
            api.onProgress((data) => {
                const callback = this.progressCallbacks.get(data.executionId);
                if (callback) {
                    callback(data);
                }
            });
        }
        // Output events - handle all 6 PowerShell streams
        if (api.onOutputStream) {
            api.onOutputStream((data) => {
                const callback = this.outputCallbacks.get(data.executionId);
                if (callback) {
                    callback(data);
                }
            });
        }
        if (api.onErrorStream) {
            api.onErrorStream((data) => {
                const callback = this.outputCallbacks.get(data.executionId);
                if (callback) {
                    callback(data);
                }
            });
        }
        if (api.onWarningStream) {
            api.onWarningStream((data) => {
                const callback = this.outputCallbacks.get(data.executionId);
                if (callback) {
                    callback(data);
                }
            });
        }
        if (api.onVerboseStream) {
            api.onVerboseStream((data) => {
                const callback = this.outputCallbacks.get(data.executionId);
                if (callback) {
                    callback(data);
                }
            });
        }
        if (api.onDebugStream) {
            api.onDebugStream((data) => {
                const callback = this.outputCallbacks.get(data.executionId);
                if (callback) {
                    callback(data);
                }
            });
        }
        if (api.onInformationStream) {
            api.onInformationStream((data) => {
                const callback = this.outputCallbacks.get(data.executionId);
                if (callback) {
                    callback(data);
                }
            });
        }
    }
    /**
     * Execute a PowerShell script
     * Mirrors C# CsvDataServiceNew.LoadUsersAsync pattern
     *
     * @param scriptPath Path to PowerShell script file
     * @param parameters Script parameters
     * @param options Execution options
     * @returns Promise resolving to execution result
     */
    async executeScript(scriptPath, parameters = {}, options = {}) {
        const api = (0,electron_api_fallback/* getElectronAPI */.d)();
        // Build script arguments from parameters (mirrors C# parameter building)
        const args = Object.entries(parameters).map(([key, value]) => {
            if (typeof value === 'boolean') {
                return value ? `-${key}` : '';
            }
            return `-${key}`;
        }).filter(Boolean);
        // Add parameter values
        Object.entries(parameters).forEach(([key, value]) => {
            if (typeof value !== 'boolean') {
                args.push(String(value));
            }
        });
        const params = {
            scriptPath,
            args,
            options: {
                timeout: options.timeout || this.config.defaultCacheTTL,
                cancellationToken: options.cancellationToken || window.crypto.randomUUID(),
                streamOutput: options.streamOutput !== false,
                ...options,
            },
        };
        try {
            const result = await api.executeScript(params);
            // Validate result structure like C# does
            if (!result.success) {
                throw new Error(result.error || 'PowerShell execution failed');
            }
            return result;
        }
        catch (error) {
            console.error(`PowerShell script execution failed: ${scriptPath}`, error);
            throw error;
        }
    }
    /**
     * Execute a PowerShell module function
     * Mirrors C# LogicEngineService.GetUsersAsync pattern
     *
     * @param modulePath Path to PowerShell module
     * @param functionName Function name to invoke
     * @param parameters Function parameters
     * @param options Execution options
     * @returns Promise resolving to execution result
     */
    async executeModule(modulePath, functionName, parameters = {}, options = {}) {
        const api = (0,electron_api_fallback/* getElectronAPI */.d)();
        const params = {
            modulePath,
            functionName,
            parameters,
            options: {
                timeout: options.timeout || this.config.defaultCacheTTL,
                cancellationToken: options.cancellationToken || window.crypto.randomUUID(),
                streamOutput: options.streamOutput !== false,
                ...options,
            },
        };
        try {
            const result = await api.executeModule(params);
            // Validate result structure like C# does
            if (!result.success) {
                throw new Error(result.error || 'PowerShell module execution failed');
            }
            return result;
        }
        catch (error) {
            console.error(`PowerShell module execution failed: ${modulePath}:${functionName}`, error);
            throw error;
        }
    }
    /**
     * Get cached result or execute function to fetch new data
     * Mirrors C# LogicEngineService caching pattern
     *
     * @param cacheKey Unique cache key
     * @param fetchFunction Function to execute if cache miss
     * @param ttl Optional custom TTL in milliseconds
     * @returns Promise resolving to cached or fresh data
     */
    async getCachedResult(cacheKey, fetchFunction, ttl) {
        // Check if we have a valid cached result
        const cached = this.cache.get(cacheKey);
        if (cached) {
            const age = Date.now() - cached.timestamp;
            if (age < cached.ttl) {
                console.log(`[PowerShellService] Cache HIT for key: ${cacheKey} (age: ${age}ms)`);
                return cached.data;
            }
            else {
                console.log(`[PowerShellService] Cache EXPIRED for key: ${cacheKey} (age: ${age}ms, ttl: ${cached.ttl}ms)`);
                this.cache.delete(cacheKey);
            }
        }
        else {
            console.log(`[PowerShellService] Cache MISS for key: ${cacheKey}`);
        }
        // Cache miss or expired - fetch fresh data
        const result = await fetchFunction();
        // Store in cache
        this.cache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
            ttl: ttl || this.config.defaultCacheTTL,
        });
        // Enforce max cache size (LRU eviction - remove oldest entry)
        if (this.cache.size > this.config.maxCacheSize) {
            const oldestKey = Array.from(this.cache.entries())
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
            this.cache.delete(oldestKey);
            console.log(`[PowerShellService] Cache size limit reached, evicted: ${oldestKey}`);
        }
        return result;
    }
    /**
     * Invalidate cache entry by key
     * @param cacheKey Cache key to invalidate
     */
    invalidateCache(cacheKey) {
        const deleted = this.cache.delete(cacheKey);
        if (deleted) {
            console.log(`[PowerShellService] Cache invalidated: ${cacheKey}`);
        }
    }
    /**
     * Invalidate all cache entries matching a prefix
     * @param prefix Key prefix to match
     */
    invalidateCacheByPrefix(prefix) {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
                count++;
            }
        }
        console.log(`[PowerShellService] Cache invalidated ${count} entries with prefix: ${prefix}`);
    }
    /**
     * Clear all cache entries
     */
    clearCache() {
        const size = this.cache.size;
        this.cache.clear();
        console.log(`[PowerShellService] Cache cleared (${size} entries removed)`);
    }
    /**
     * Register a progress callback for a specific execution
     * @param executionId Execution ID
     * @param callback Progress callback function
     * @returns Cleanup function
     */
    onProgress(executionId, callback) {
        this.progressCallbacks.set(executionId, callback);
        return () => {
            this.progressCallbacks.delete(executionId);
        };
    }
    /**
     * Register an output callback for a specific execution
     * @param executionId Execution ID
     * @param callback Output callback function
     * @returns Cleanup function
     */
    onOutput(executionId, callback) {
        this.outputCallbacks.set(executionId, callback);
        return () => {
            this.outputCallbacks.delete(executionId);
        };
    }
    /**
     * Cancel a running PowerShell execution
     * @param cancellationToken Cancellation token
     * @returns Promise resolving to true if cancelled successfully
     */
    async cancelExecution(cancellationToken) {
        const api = (0,electron_api_fallback/* getElectronAPI */.d)();
        try {
            const cancelled = await api.cancelExecution(cancellationToken);
            if (cancelled) {
                console.log(`[PowerShellService] Execution cancelled: ${cancellationToken}`);
                // Clean up callbacks
                this.progressCallbacks.delete(cancellationToken);
                this.outputCallbacks.delete(cancellationToken);
            }
            return cancelled;
        }
        catch (error) {
            console.error(`Failed to cancel execution: ${cancellationToken}`, error);
            return false;
        }
    }
    /**
     * Start periodic cache cleanup
     * Removes expired entries automatically
     */
    startCacheCleanup() {
        this.cacheCleanupInterval = setInterval(() => {
            const now = Date.now();
            let cleaned = 0;
            for (const [key, cached] of this.cache.entries()) {
                const age = now - cached.timestamp;
                if (age >= cached.ttl) {
                    this.cache.delete(key);
                    cleaned++;
                }
            }
            if (cleaned > 0) {
                console.log(`[PowerShellService] Cache cleanup: removed ${cleaned} expired entries`);
            }
        }, this.config.cacheCleanupInterval);
    }
    /**
     * Stop cache cleanup interval
     */
    stopCacheCleanup() {
        if (this.cacheCleanupInterval) {
            clearInterval(this.cacheCleanupInterval);
            this.cacheCleanupInterval = null;
        }
    }
    /**
     * Get cache statistics
     */
    getCacheStatistics() {
        const now = Date.now();
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.entries()).map(([key, cached]) => ({
                key,
                age: now - cached.timestamp,
                ttl: cached.ttl,
            })),
        };
    }
    /**
     * Cleanup resources
     */
    dispose() {
        this.stopCacheCleanup();
        this.clearCache();
        this.progressCallbacks.clear();
        this.outputCallbacks.clear();
    }
}
// Export singleton instance
const powerShellService = new PowerShellService();
// Export class for custom instances
/* harmony default export */ const services_powerShellService = ((/* unused pure expression or super */ null && (PowerShellService)));

// EXTERNAL MODULE: ./src/renderer/store/useProfileStore.ts
var useProfileStore = __webpack_require__(33813);
;// ./src/renderer/hooks/useUserManagementLogic.ts





const useUserManagementLogic = () => {
    const [users, setUsers] = (0,react.useState)([]);
    const [isLoading, setIsLoading] = (0,react.useState)(false);
    const [searchQuery, setSearchQuery] = (0,react.useState)('');
    const [roleFilter, setRoleFilter] = (0,react.useState)('');
    const [statusFilter, setStatusFilter] = (0,react.useState)('');
    const [selectedUsers, setSelectedUsers] = (0,react.useState)([]);
    const [loadingMessage, setLoadingMessage] = (0,react.useState)('');
    const [warnings, setWarnings] = (0,react.useState)([]);
    const { addNotification } = (0,useNotificationStore/* useNotificationStore */.i)();
    const { getCurrentSourceProfile } = (0,useProfileStore/* useProfileStore */.K)();
    (0,react.useEffect)(() => {
        loadUsers();
    }, []);
    const loadUsers = async () => {
        setIsLoading(true);
        setWarnings([]);
        try {
            setLoadingMessage('Checking cache and data sources...');
            const selectedProfile = getCurrentSourceProfile();
            // First try cached data (mirror LogicEngineService pattern)
            let usersData;
            try {
                usersData = await powerShellService.getCachedResult(`app_users_${selectedProfile?.id || 'default'}`, async () => {
                    setLoadingMessage('Loading application users from PowerShell modules...');
                    // Try to execute Get-ApplicationUsers module
                    const result = await powerShellService.executeModule('Modules/Admin/UserManagement.psm1', 'Get-ApplicationUsers', {
                        ProfileName: selectedProfile?.companyName || 'Default',
                    });
                    return result.data?.users || [];
                });
            }
            catch (moduleError) {
                // Fallback to CSV service (mirror C# fallback pattern)
                console.warn('Module execution failed, falling back to CSV:', moduleError);
                setLoadingMessage('Loading users from CSV files...');
                try {
                    const csvResult = await powerShellService.executeScript('Scripts/Get-AppUsersFromCsv.ps1', { ProfilePath: selectedProfile?.dataPath || 'C:\\discoverydata' });
                    usersData = csvResult.data?.users || [];
                    // Mirror C# header warnings
                    if (csvResult.warnings && csvResult.warnings.length > 0) {
                        setWarnings(csvResult.warnings);
                    }
                }
                catch (csvError) {
                    console.error('CSV fallback also failed:', csvError);
                    // Use mock data as last resort
                    usersData = getMockUsers();
                    setWarnings(['PowerShell execution failed. Using mock data.']);
                }
            }
            setUsers(usersData);
            setLoadingMessage('');
        }
        catch (error) {
            addNotification({ type: 'error', title: 'Load Failed', message: 'Failed to load users', pinned: false, priority: 'normal' });
            console.error('Failed to load users:', error);
            // Use mock data on error
            setUsers(getMockUsers());
        }
        finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    const getMockUsers = () => [
        {
            id: '1',
            username: 'admin',
            displayName: 'System Administrator',
            email: 'admin@company.com',
            role: 'Administrator',
            status: 'Active',
            lastLogin: new Date('2025-10-03T14:30:00'),
            createdDate: new Date('2024-01-01'),
            createdBy: 'system',
            modifiedDate: new Date('2025-10-03'),
            modifiedBy: 'admin',
        },
        {
            id: '2',
            username: 'jsmith',
            displayName: 'John Smith',
            email: 'jsmith@company.com',
            role: 'PowerUser',
            status: 'Active',
            lastLogin: new Date('2025-10-03T10:15:00'),
            createdDate: new Date('2024-03-15'),
            createdBy: 'admin',
            modifiedDate: new Date('2025-09-20'),
            modifiedBy: 'admin',
        },
        {
            id: '3',
            username: 'mjones',
            displayName: 'Mary Jones',
            email: 'mjones@company.com',
            role: 'User',
            status: 'Active',
            lastLogin: new Date('2025-10-02T16:45:00'),
            createdDate: new Date('2024-06-01'),
            createdBy: 'admin',
            modifiedDate: new Date('2024-06-01'),
            modifiedBy: 'admin',
        },
        {
            id: '4',
            username: 'rdavis',
            displayName: 'Robert Davis',
            email: 'rdavis@company.com',
            role: 'ReadOnly',
            status: 'Disabled',
            lastLogin: new Date('2025-09-15T09:00:00'),
            createdDate: new Date('2024-08-10'),
            createdBy: 'admin',
            modifiedDate: new Date('2025-09-30'),
            modifiedBy: 'admin',
        },
    ];
    const handleCreateUser = () => {
        // Open create user dialog
        addNotification({ type: 'info', title: 'Create User', message: 'Create user dialog would open here', pinned: false, priority: 'normal' });
    };
    const handleEditUser = (user) => {
        addNotification({ type: 'info', title: 'Edit User', message: `Edit user: ${user.username}`, pinned: false, priority: 'normal' });
    };
    const handleDeleteUsers = async () => {
        if (selectedUsers.length === 0)
            return;
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setUsers(prev => prev.filter(u => !selectedUsers.find(s => s.id === u.id)));
            setSelectedUsers([]);
            addNotification({ type: 'success', title: 'Users Deleted', message: `Deleted ${selectedUsers.length} user(s)`, pinned: false, priority: 'normal' });
        }
        catch (error) {
            addNotification({ type: 'error', title: 'Delete Failed', message: 'Failed to delete users', pinned: false, priority: 'normal' });
        }
    };
    const handleToggleUserStatus = async (user) => {
        try {
            const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
            addNotification({ type: 'success', title: 'Status Updated', message: `User ${newStatus.toLowerCase()}`, pinned: false, priority: 'normal' });
        }
        catch (error) {
            addNotification({ type: 'error', title: 'Update Failed', message: 'Failed to update user status', pinned: false, priority: 'normal' });
        }
    };
    const handleResetPassword = async (user) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            addNotification({ type: 'success', title: 'Password Reset', message: `Password reset email sent to ${user.email}`, pinned: false, priority: 'normal' });
        }
        catch (error) {
            addNotification({ type: 'error', title: 'Reset Failed', message: 'Failed to reset password', pinned: false, priority: 'normal' });
        }
    };
    const handleAssignRole = async (user, newRole) => {
        try {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
            addNotification({ type: 'success', title: 'Role Updated', message: `Role updated to ${newRole}`, pinned: false, priority: 'normal' });
        }
        catch (error) {
            addNotification({ type: 'error', title: 'Role Assignment Failed', message: 'Failed to assign role', pinned: false, priority: 'normal' });
        }
    };
    const handleExport = async () => {
        try {
            const filteredUsers = getFilteredUsers();
            await exportService/* default */.A.exportToExcel(filteredUsers, 'Users');
            addNotification({ type: 'success', title: 'Export Complete', message: 'Users exported successfully', pinned: false, priority: 'normal' });
        }
        catch (error) {
            addNotification({ type: 'error', title: 'Export Failed', message: 'Failed to export users', pinned: false, priority: 'normal' });
        }
    };
    const getFilteredUsers = () => {
        return users.filter(user => {
            const matchesSearch = searchQuery === '' ||
                (user.username ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.displayName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.email ?? '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === '' || user.role === roleFilter;
            const matchesStatus = statusFilter === '' || user.status === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    };
    return {
        users: getFilteredUsers(),
        isLoading,
        searchQuery,
        roleFilter,
        statusFilter,
        selectedUsers,
        setSearchQuery,
        setRoleFilter,
        setStatusFilter,
        handleCreateUser,
        handleEditUser,
        handleDeleteUsers,
        handleToggleUserStatus,
        handleResetPassword,
        handleAssignRole,
        handleExport,
        loadingMessage,
        warnings,
    };
};

;// ./src/renderer/views/admin/UserManagementView.tsx









const UserManagementView = () => {
    const { users, isLoading, searchQuery, roleFilter, statusFilter, selectedUsers, setSearchQuery, setRoleFilter, setStatusFilter, handleCreateUser, handleEditUser, handleDeleteUsers, handleToggleUserStatus, handleResetPassword, handleAssignRole, handleExport, } = useUserManagementLogic();
    const columns = [
        {
            field: 'username',
            headerName: 'Username',
            sortable: true,
            filter: 'agTextColumnFilter',
            flex: 1,
        },
        {
            field: 'displayName',
            headerName: 'Display Name',
            sortable: true,
            filter: 'agTextColumnFilter',
            flex: 1,
        },
        {
            field: 'email',
            headerName: 'Email',
            sortable: true,
            filter: 'agTextColumnFilter',
            flex: 1,
        },
        {
            field: 'role',
            headerName: 'Role',
            sortable: true,
            filter: 'agSetColumnFilter',
            cellRenderer: (params) => ((0,jsx_runtime.jsx)(Badge/* Badge */.E, { variant: params.value === 'Administrator' ? 'danger' : params.value === 'PowerUser' ? 'warning' : 'info', children: params.value })),
        },
        {
            field: 'status',
            headerName: 'Status',
            sortable: true,
            filter: 'agSetColumnFilter',
            cellRenderer: (params) => ((0,jsx_runtime.jsx)(Badge/* Badge */.E, { variant: params.value === 'Active' ? 'success' : 'default', children: params.value })),
        },
        {
            field: 'lastLogin',
            headerName: 'Last Login',
            sortable: true,
            filter: 'agDateColumnFilter',
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'Never',
        },
        {
            field: 'createdDate',
            headerName: 'Created',
            sortable: true,
            filter: 'agDateColumnFilter',
            valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            filter: false,
            cellRenderer: (params) => ((0,jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { size: "sm", variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Edit2 */.Pt, {}), onClick: () => handleEditUser(params.data), "aria-label": "Edit user", children: "Edit" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { size: "sm", variant: params.data.status === 'Active' ? 'secondary' : 'primary', icon: params.data.status === 'Active' ? (0,jsx_runtime.jsx)(lucide_react/* Lock */.c_I, {}) : (0,jsx_runtime.jsx)(lucide_react/* Unlock */.$VH, {}), onClick: () => handleToggleUserStatus(params.data), "aria-label": params.data.status === 'Active' ? 'Disable user' : 'Enable user', children: params.data.status === 'Active' ? 'Disable' : 'Enable' }), (0,jsx_runtime.jsx)(Button/* Button */.$, { size: "sm", variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Shield */.ekZ, {}), onClick: () => handleResetPassword(params.data), "aria-label": "Reset password", children: "Reset" })] })),
        },
    ];
    return ((0,jsx_runtime.jsxs)("div", { className: "flex flex-col h-full p-6 space-y-6", "data-testid": "user-management-view", "data-cy": "user-management-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between items-center", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "User Management" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: "Manage application users, roles, and permissions" })] }), (0,jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react/* UserPlus */.ypN, {}), onClick: handleCreateUser, children: "Create User" }), (0,jsx_runtime.jsxs)(Button/* Button */.$, { variant: "danger", icon: (0,jsx_runtime.jsx)(lucide_react/* Trash2 */.TBR, {}), onClick: handleDeleteUsers, disabled: (selectedUsers ?? []).length === 0, children: ["Delete Selected (", (selectedUsers ?? []).length, ")"] })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex gap-4 items-end", children: [(0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(Input/* Input */.p, { label: "Search Users", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search by username, email, or name..." }) }), (0,jsx_runtime.jsx)("div", { className: "w-48", children: (0,jsx_runtime.jsx)(Select/* Select */.l, { label: "Role", value: roleFilter, onChange: (value) => setRoleFilter(value), options: [
                                { value: "", label: "All Roles" },
                                { value: "Administrator", label: "Administrator" },
                                { value: "PowerUser", label: "Power User" },
                                { value: "User", label: "User" },
                                { value: "ReadOnly", label: "Read Only" },
                            ] }) }), (0,jsx_runtime.jsx)("div", { className: "w-48", children: (0,jsx_runtime.jsx)(Select/* Select */.l, { label: "Status", value: statusFilter, onChange: (value) => setStatusFilter(value), options: [
                                { value: "", label: "All Statuses" },
                                { value: "Active", label: "Active" },
                                { value: "Disabled", label: "Disabled" },
                                { value: "Locked", label: "Locked" },
                            ] }) }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", onClick: handleExport, children: "Export" })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-4 gap-4", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-blue-600 dark:text-blue-400", children: "Total Users" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-blue-900 dark:text-blue-100", children: (users ?? []).length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-green-600 dark:text-green-400", children: "Active" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-green-900 dark:text-green-100", children: (users ?? []).filter(u => u.status === 'Active').length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-yellow-600 dark:text-yellow-400", children: "Administrators" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-yellow-900 dark:text-yellow-100", children: (users ?? []).filter(u => u.role === 'Administrator').length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-red-600 dark:text-red-400", children: "Disabled" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-red-900 dark:text-red-100", children: (users ?? []).filter(u => u.status === 'Disabled').length })] })] }), (0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid/* VirtualizedDataGrid */.Q, { data: users, columns: columns, loading: isLoading }) })] }));
};
/* harmony default export */ const admin_UserManagementView = (UserManagementView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNwRSwrQkFBK0IsR0FBRyxHQUFHLG1CQUFJLENBQUMsb0JBQU0sSUFBSSxpRUFBaUUsSUFBSSxHQUFHLG9CQUFLLFVBQVUsZ0RBQWdELG9CQUFLLFVBQVUsbUhBQW1ILG1CQUFJLFVBQVUsZ0ZBQWdGLEdBQUcsbUJBQUksVUFBVSxrR0FBa0csSUFBSSxHQUFHLG9CQUFLLFVBQVUsdUhBQXVILG1CQUFJLFVBQVUsNkVBQTZFLEdBQUcsbUJBQUksVUFBVSx1SUFBdUksSUFBSSxHQUFHLG9CQUFLLFVBQVUsMkhBQTJILG1CQUFJLFVBQVUsdUZBQXVGLEdBQUcsbUJBQUksVUFBVSw4SUFBOEksSUFBSSxHQUFHLG9CQUFLLFVBQVUsK0dBQStHLG1CQUFJLFVBQVUsMkVBQTJFLEdBQUcsbUJBQUksVUFBVSxxSUFBcUksSUFBSSxJQUFJLEdBQUcsbUJBQUksVUFBVSwrQkFBK0IsbUJBQUksQ0FBQyw4Q0FBbUIsSUFBSSxtREFBbUQsR0FBRyxJQUFJO0FBQ3J5RDtBQUNBLCtEQUFlLGtCQUFrQixFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvc2VydmljZXMvcG93ZXJTaGVsbFNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlVXNlck1hbmFnZW1lbnRMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9hZG1pbi9Vc2VyTWFuYWdlbWVudFZpZXcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUmVuZGVyZXItc2lkZSBQb3dlclNoZWxsIFNlcnZpY2VcbiAqXG4gKiBNaXJyb3JzIEMjIENzdkRhdGFTZXJ2aWNlTmV3IGFuZCBMb2dpY0VuZ2luZVNlcnZpY2UgcGF0dGVybnMgd2l0aDpcbiAqIC0gU2Vzc2lvbi1iYXNlZCBjYWNoaW5nIHdpdGggVFRMIChUaW1lIFRvIExpdmUpXG4gKiAtIEF1dG9tYXRpYyBjYWNoZSBpbnZhbGlkYXRpb25cbiAqIC0gUHJvZ3Jlc3MgcmVwb3J0aW5nXG4gKiAtIENhbmNlbGxhdGlvbiBzdXBwb3J0XG4gKiAtIEZhbGxiYWNrIG1lY2hhbmlzbXNcbiAqIC0gU2NyaXB0IGFuZCBtb2R1bGUgZXhlY3V0aW9uXG4gKlxuICogVGhpcyBzZXJ2aWNlIGFjdHMgYXMgYSBjbGllbnQtc2lkZSB3cmFwcGVyIGFyb3VuZCB0aGUgRWxlY3Ryb24gSVBDIFBvd2VyU2hlbGwgZXhlY3V0aW9uLlxuICovXG5pbXBvcnQgeyBnZXRFbGVjdHJvbkFQSSB9IGZyb20gJy4uL2xpYi9lbGVjdHJvbi1hcGktZmFsbGJhY2snO1xuLyoqXG4gKiBQb3dlclNoZWxsIFNlcnZpY2UgLSBDbGllbnQtc2lkZSB3cmFwcGVyIGZvciBQb3dlclNoZWxsIGV4ZWN1dGlvblxuICpcbiAqIE1pcnJvcnMgQyMgcGF0dGVybnMgZnJvbTpcbiAqIC0gR1VJL1NlcnZpY2VzL0NzdkRhdGFTZXJ2aWNlTmV3LmNzXG4gKiAtIEdVSS9TZXJ2aWNlcy9Mb2dpY0VuZ2luZVNlcnZpY2UuY3NcbiAqIC0gR1VJL1NlcnZpY2VzL1Bvd2VyU2hlbGxFeGVjdXRvci5jc1xuICovXG5leHBvcnQgY2xhc3MgUG93ZXJTaGVsbFNlcnZpY2Uge1xuICAgIGNhY2hlID0gbmV3IE1hcCgpO1xuICAgIGNvbmZpZztcbiAgICBjYWNoZUNsZWFudXBJbnRlcnZhbCA9IG51bGw7XG4gICAgcHJvZ3Jlc3NDYWxsYmFja3MgPSBuZXcgTWFwKCk7XG4gICAgb3V0cHV0Q2FsbGJhY2tzID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgICAgIGRlZmF1bHRDYWNoZVRUTDogMzAwMDAwLCAvLyA1IG1pbnV0ZXMgbGlrZSBDI1xuICAgICAgICAgICAgZW5hYmxlQ2FjaGVDbGVhbnVwOiB0cnVlLFxuICAgICAgICAgICAgY2FjaGVDbGVhbnVwSW50ZXJ2YWw6IDYwMDAwLCAvLyAxIG1pbnV0ZVxuICAgICAgICAgICAgbWF4Q2FjaGVTaXplOiAxMDAsXG4gICAgICAgICAgICAuLi5jb25maWcsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5lbmFibGVDYWNoZUNsZWFudXApIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRDYWNoZUNsZWFudXAoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTZXR1cCBJUEMgZXZlbnQgbGlzdGVuZXJzIGZvciBwcm9ncmVzcyBhbmQgb3V0cHV0XG4gICAgICAgIHRoaXMuc2V0dXBFdmVudExpc3RlbmVycygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXR1cCBldmVudCBsaXN0ZW5lcnMgZm9yIFBvd2VyU2hlbGwgZXhlY3V0aW9uIGV2ZW50c1xuICAgICAqIE1pcnJvcnMgQyMgZXZlbnQgaGFuZGxpbmcgcGF0dGVybnNcbiAgICAgKi9cbiAgICBzZXR1cEV2ZW50TGlzdGVuZXJzKCkge1xuICAgICAgICBjb25zdCBhcGkgPSBnZXRFbGVjdHJvbkFQSSgpO1xuICAgICAgICBpZiAoIWFwaSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gUHJvZ3Jlc3MgZXZlbnRzXG4gICAgICAgIGlmIChhcGkub25Qcm9ncmVzcykge1xuICAgICAgICAgICAgYXBpLm9uUHJvZ3Jlc3MoKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYWxsYmFjayA9IHRoaXMucHJvZ3Jlc3NDYWxsYmFja3MuZ2V0KGRhdGEuZXhlY3V0aW9uSWQpO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPdXRwdXQgZXZlbnRzIC0gaGFuZGxlIGFsbCA2IFBvd2VyU2hlbGwgc3RyZWFtc1xuICAgICAgICBpZiAoYXBpLm9uT3V0cHV0U3RyZWFtKSB7XG4gICAgICAgICAgICBhcGkub25PdXRwdXRTdHJlYW0oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYWxsYmFjayA9IHRoaXMub3V0cHV0Q2FsbGJhY2tzLmdldChkYXRhLmV4ZWN1dGlvbklkKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFwaS5vbkVycm9yU3RyZWFtKSB7XG4gICAgICAgICAgICBhcGkub25FcnJvclN0cmVhbSgoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gdGhpcy5vdXRwdXRDYWxsYmFja3MuZ2V0KGRhdGEuZXhlY3V0aW9uSWQpO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXBpLm9uV2FybmluZ1N0cmVhbSkge1xuICAgICAgICAgICAgYXBpLm9uV2FybmluZ1N0cmVhbSgoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gdGhpcy5vdXRwdXRDYWxsYmFja3MuZ2V0KGRhdGEuZXhlY3V0aW9uSWQpO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXBpLm9uVmVyYm9zZVN0cmVhbSkge1xuICAgICAgICAgICAgYXBpLm9uVmVyYm9zZVN0cmVhbSgoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gdGhpcy5vdXRwdXRDYWxsYmFja3MuZ2V0KGRhdGEuZXhlY3V0aW9uSWQpO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXBpLm9uRGVidWdTdHJlYW0pIHtcbiAgICAgICAgICAgIGFwaS5vbkRlYnVnU3RyZWFtKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLm91dHB1dENhbGxiYWNrcy5nZXQoZGF0YS5leGVjdXRpb25JZCk7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhcGkub25JbmZvcm1hdGlvblN0cmVhbSkge1xuICAgICAgICAgICAgYXBpLm9uSW5mb3JtYXRpb25TdHJlYW0oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYWxsYmFjayA9IHRoaXMub3V0cHV0Q2FsbGJhY2tzLmdldChkYXRhLmV4ZWN1dGlvbklkKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhIFBvd2VyU2hlbGwgc2NyaXB0XG4gICAgICogTWlycm9ycyBDIyBDc3ZEYXRhU2VydmljZU5ldy5Mb2FkVXNlcnNBc3luYyBwYXR0ZXJuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2NyaXB0UGF0aCBQYXRoIHRvIFBvd2VyU2hlbGwgc2NyaXB0IGZpbGVcbiAgICAgKiBAcGFyYW0gcGFyYW1ldGVycyBTY3JpcHQgcGFyYW1ldGVyc1xuICAgICAqIEBwYXJhbSBvcHRpb25zIEV4ZWN1dGlvbiBvcHRpb25zXG4gICAgICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZpbmcgdG8gZXhlY3V0aW9uIHJlc3VsdFxuICAgICAqL1xuICAgIGFzeW5jIGV4ZWN1dGVTY3JpcHQoc2NyaXB0UGF0aCwgcGFyYW1ldGVycyA9IHt9LCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgY29uc3QgYXBpID0gZ2V0RWxlY3Ryb25BUEkoKTtcbiAgICAgICAgLy8gQnVpbGQgc2NyaXB0IGFyZ3VtZW50cyBmcm9tIHBhcmFtZXRlcnMgKG1pcnJvcnMgQyMgcGFyYW1ldGVyIGJ1aWxkaW5nKVxuICAgICAgICBjb25zdCBhcmdzID0gT2JqZWN0LmVudHJpZXMocGFyYW1ldGVycykubWFwKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA/IGAtJHtrZXl9YCA6ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGAtJHtrZXl9YDtcbiAgICAgICAgfSkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICAvLyBBZGQgcGFyYW1ldGVyIHZhbHVlc1xuICAgICAgICBPYmplY3QuZW50cmllcyhwYXJhbWV0ZXJzKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgICAgIGFyZ3MucHVzaChTdHJpbmcodmFsdWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgICAgIHNjcmlwdFBhdGgsXG4gICAgICAgICAgICBhcmdzLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IG9wdGlvbnMudGltZW91dCB8fCB0aGlzLmNvbmZpZy5kZWZhdWx0Q2FjaGVUVEwsXG4gICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IG9wdGlvbnMuY2FuY2VsbGF0aW9uVG9rZW4gfHwgd2luZG93LmNyeXB0by5yYW5kb21VVUlEKCksXG4gICAgICAgICAgICAgICAgc3RyZWFtT3V0cHV0OiBvcHRpb25zLnN0cmVhbU91dHB1dCAhPT0gZmFsc2UsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkuZXhlY3V0ZVNjcmlwdChwYXJhbXMpO1xuICAgICAgICAgICAgLy8gVmFsaWRhdGUgcmVzdWx0IHN0cnVjdHVyZSBsaWtlIEMjIGRvZXNcbiAgICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8ICdQb3dlclNoZWxsIGV4ZWN1dGlvbiBmYWlsZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBQb3dlclNoZWxsIHNjcmlwdCBleGVjdXRpb24gZmFpbGVkOiAke3NjcmlwdFBhdGh9YCwgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhIFBvd2VyU2hlbGwgbW9kdWxlIGZ1bmN0aW9uXG4gICAgICogTWlycm9ycyBDIyBMb2dpY0VuZ2luZVNlcnZpY2UuR2V0VXNlcnNBc3luYyBwYXR0ZXJuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbW9kdWxlUGF0aCBQYXRoIHRvIFBvd2VyU2hlbGwgbW9kdWxlXG4gICAgICogQHBhcmFtIGZ1bmN0aW9uTmFtZSBGdW5jdGlvbiBuYW1lIHRvIGludm9rZVxuICAgICAqIEBwYXJhbSBwYXJhbWV0ZXJzIEZ1bmN0aW9uIHBhcmFtZXRlcnNcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyBFeGVjdXRpb24gb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIGV4ZWN1dGlvbiByZXN1bHRcbiAgICAgKi9cbiAgICBhc3luYyBleGVjdXRlTW9kdWxlKG1vZHVsZVBhdGgsIGZ1bmN0aW9uTmFtZSwgcGFyYW1ldGVycyA9IHt9LCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgY29uc3QgYXBpID0gZ2V0RWxlY3Ryb25BUEkoKTtcbiAgICAgICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICAgICAgbW9kdWxlUGF0aCxcbiAgICAgICAgICAgIGZ1bmN0aW9uTmFtZSxcbiAgICAgICAgICAgIHBhcmFtZXRlcnMsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgdGltZW91dDogb3B0aW9ucy50aW1lb3V0IHx8IHRoaXMuY29uZmlnLmRlZmF1bHRDYWNoZVRUTCxcbiAgICAgICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbjogb3B0aW9ucy5jYW5jZWxsYXRpb25Ub2tlbiB8fCB3aW5kb3cuY3J5cHRvLnJhbmRvbVVVSUQoKSxcbiAgICAgICAgICAgICAgICBzdHJlYW1PdXRwdXQ6IG9wdGlvbnMuc3RyZWFtT3V0cHV0ICE9PSBmYWxzZSxcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5leGVjdXRlTW9kdWxlKHBhcmFtcyk7XG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSByZXN1bHQgc3RydWN0dXJlIGxpa2UgQyMgZG9lc1xuICAgICAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZXN1bHQuZXJyb3IgfHwgJ1Bvd2VyU2hlbGwgbW9kdWxlIGV4ZWN1dGlvbiBmYWlsZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBQb3dlclNoZWxsIG1vZHVsZSBleGVjdXRpb24gZmFpbGVkOiAke21vZHVsZVBhdGh9OiR7ZnVuY3Rpb25OYW1lfWAsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBjYWNoZWQgcmVzdWx0IG9yIGV4ZWN1dGUgZnVuY3Rpb24gdG8gZmV0Y2ggbmV3IGRhdGFcbiAgICAgKiBNaXJyb3JzIEMjIExvZ2ljRW5naW5lU2VydmljZSBjYWNoaW5nIHBhdHRlcm5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjYWNoZUtleSBVbmlxdWUgY2FjaGUga2V5XG4gICAgICogQHBhcmFtIGZldGNoRnVuY3Rpb24gRnVuY3Rpb24gdG8gZXhlY3V0ZSBpZiBjYWNoZSBtaXNzXG4gICAgICogQHBhcmFtIHR0bCBPcHRpb25hbCBjdXN0b20gVFRMIGluIG1pbGxpc2Vjb25kc1xuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIGNhY2hlZCBvciBmcmVzaCBkYXRhXG4gICAgICovXG4gICAgYXN5bmMgZ2V0Q2FjaGVkUmVzdWx0KGNhY2hlS2V5LCBmZXRjaEZ1bmN0aW9uLCB0dGwpIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgd2UgaGF2ZSBhIHZhbGlkIGNhY2hlZCByZXN1bHRcbiAgICAgICAgY29uc3QgY2FjaGVkID0gdGhpcy5jYWNoZS5nZXQoY2FjaGVLZXkpO1xuICAgICAgICBpZiAoY2FjaGVkKSB7XG4gICAgICAgICAgICBjb25zdCBhZ2UgPSBEYXRlLm5vdygpIC0gY2FjaGVkLnRpbWVzdGFtcDtcbiAgICAgICAgICAgIGlmIChhZ2UgPCBjYWNoZWQudHRsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtQb3dlclNoZWxsU2VydmljZV0gQ2FjaGUgSElUIGZvciBrZXk6ICR7Y2FjaGVLZXl9IChhZ2U6ICR7YWdlfW1zKWApO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWNoZWQuZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUG93ZXJTaGVsbFNlcnZpY2VdIENhY2hlIEVYUElSRUQgZm9yIGtleTogJHtjYWNoZUtleX0gKGFnZTogJHthZ2V9bXMsIHR0bDogJHtjYWNoZWQudHRsfW1zKWApO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FjaGUuZGVsZXRlKGNhY2hlS2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUG93ZXJTaGVsbFNlcnZpY2VdIENhY2hlIE1JU1MgZm9yIGtleTogJHtjYWNoZUtleX1gKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDYWNoZSBtaXNzIG9yIGV4cGlyZWQgLSBmZXRjaCBmcmVzaCBkYXRhXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZldGNoRnVuY3Rpb24oKTtcbiAgICAgICAgLy8gU3RvcmUgaW4gY2FjaGVcbiAgICAgICAgdGhpcy5jYWNoZS5zZXQoY2FjaGVLZXksIHtcbiAgICAgICAgICAgIGRhdGE6IHJlc3VsdCxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIHR0bDogdHRsIHx8IHRoaXMuY29uZmlnLmRlZmF1bHRDYWNoZVRUTCxcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEVuZm9yY2UgbWF4IGNhY2hlIHNpemUgKExSVSBldmljdGlvbiAtIHJlbW92ZSBvbGRlc3QgZW50cnkpXG4gICAgICAgIGlmICh0aGlzLmNhY2hlLnNpemUgPiB0aGlzLmNvbmZpZy5tYXhDYWNoZVNpemUpIHtcbiAgICAgICAgICAgIGNvbnN0IG9sZGVzdEtleSA9IEFycmF5LmZyb20odGhpcy5jYWNoZS5lbnRyaWVzKCkpXG4gICAgICAgICAgICAgICAgLnNvcnQoKFssIGFdLCBbLCBiXSkgPT4gYS50aW1lc3RhbXAgLSBiLnRpbWVzdGFtcClbMF1bMF07XG4gICAgICAgICAgICB0aGlzLmNhY2hlLmRlbGV0ZShvbGRlc3RLZXkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtQb3dlclNoZWxsU2VydmljZV0gQ2FjaGUgc2l6ZSBsaW1pdCByZWFjaGVkLCBldmljdGVkOiAke29sZGVzdEtleX1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbnZhbGlkYXRlIGNhY2hlIGVudHJ5IGJ5IGtleVxuICAgICAqIEBwYXJhbSBjYWNoZUtleSBDYWNoZSBrZXkgdG8gaW52YWxpZGF0ZVxuICAgICAqL1xuICAgIGludmFsaWRhdGVDYWNoZShjYWNoZUtleSkge1xuICAgICAgICBjb25zdCBkZWxldGVkID0gdGhpcy5jYWNoZS5kZWxldGUoY2FjaGVLZXkpO1xuICAgICAgICBpZiAoZGVsZXRlZCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtQb3dlclNoZWxsU2VydmljZV0gQ2FjaGUgaW52YWxpZGF0ZWQ6ICR7Y2FjaGVLZXl9YCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogSW52YWxpZGF0ZSBhbGwgY2FjaGUgZW50cmllcyBtYXRjaGluZyBhIHByZWZpeFxuICAgICAqIEBwYXJhbSBwcmVmaXggS2V5IHByZWZpeCB0byBtYXRjaFxuICAgICAqL1xuICAgIGludmFsaWRhdGVDYWNoZUJ5UHJlZml4KHByZWZpeCkge1xuICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB0aGlzLmNhY2hlLmtleXMoKSkge1xuICAgICAgICAgICAgaWYgKGtleS5zdGFydHNXaXRoKHByZWZpeCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhY2hlLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFtQb3dlclNoZWxsU2VydmljZV0gQ2FjaGUgaW52YWxpZGF0ZWQgJHtjb3VudH0gZW50cmllcyB3aXRoIHByZWZpeDogJHtwcmVmaXh9YCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBjYWNoZSBlbnRyaWVzXG4gICAgICovXG4gICAgY2xlYXJDYWNoZSgpIHtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IHRoaXMuY2FjaGUuc2l6ZTtcbiAgICAgICAgdGhpcy5jYWNoZS5jbGVhcigpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW1Bvd2VyU2hlbGxTZXJ2aWNlXSBDYWNoZSBjbGVhcmVkICgke3NpemV9IGVudHJpZXMgcmVtb3ZlZClgKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYSBwcm9ncmVzcyBjYWxsYmFjayBmb3IgYSBzcGVjaWZpYyBleGVjdXRpb25cbiAgICAgKiBAcGFyYW0gZXhlY3V0aW9uSWQgRXhlY3V0aW9uIElEXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIFByb2dyZXNzIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICogQHJldHVybnMgQ2xlYW51cCBmdW5jdGlvblxuICAgICAqL1xuICAgIG9uUHJvZ3Jlc3MoZXhlY3V0aW9uSWQsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMucHJvZ3Jlc3NDYWxsYmFja3Muc2V0KGV4ZWN1dGlvbklkLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzQ2FsbGJhY2tzLmRlbGV0ZShleGVjdXRpb25JZCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGFuIG91dHB1dCBjYWxsYmFjayBmb3IgYSBzcGVjaWZpYyBleGVjdXRpb25cbiAgICAgKiBAcGFyYW0gZXhlY3V0aW9uSWQgRXhlY3V0aW9uIElEXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIE91dHB1dCBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqIEByZXR1cm5zIENsZWFudXAgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBvbk91dHB1dChleGVjdXRpb25JZCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5vdXRwdXRDYWxsYmFja3Muc2V0KGV4ZWN1dGlvbklkLCBjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm91dHB1dENhbGxiYWNrcy5kZWxldGUoZXhlY3V0aW9uSWQpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYW5jZWwgYSBydW5uaW5nIFBvd2VyU2hlbGwgZXhlY3V0aW9uXG4gICAgICogQHBhcmFtIGNhbmNlbGxhdGlvblRva2VuIENhbmNlbGxhdGlvbiB0b2tlblxuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIHRydWUgaWYgY2FuY2VsbGVkIHN1Y2Nlc3NmdWxseVxuICAgICAqL1xuICAgIGFzeW5jIGNhbmNlbEV4ZWN1dGlvbihjYW5jZWxsYXRpb25Ub2tlbikge1xuICAgICAgICBjb25zdCBhcGkgPSBnZXRFbGVjdHJvbkFQSSgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY2FuY2VsbGVkID0gYXdhaXQgYXBpLmNhbmNlbEV4ZWN1dGlvbihjYW5jZWxsYXRpb25Ub2tlbik7XG4gICAgICAgICAgICBpZiAoY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtQb3dlclNoZWxsU2VydmljZV0gRXhlY3V0aW9uIGNhbmNlbGxlZDogJHtjYW5jZWxsYXRpb25Ub2tlbn1gKTtcbiAgICAgICAgICAgICAgICAvLyBDbGVhbiB1cCBjYWxsYmFja3NcbiAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzQ2FsbGJhY2tzLmRlbGV0ZShjYW5jZWxsYXRpb25Ub2tlbik7XG4gICAgICAgICAgICAgICAgdGhpcy5vdXRwdXRDYWxsYmFja3MuZGVsZXRlKGNhbmNlbGxhdGlvblRva2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjYW5jZWxsZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gY2FuY2VsIGV4ZWN1dGlvbjogJHtjYW5jZWxsYXRpb25Ub2tlbn1gLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RhcnQgcGVyaW9kaWMgY2FjaGUgY2xlYW51cFxuICAgICAqIFJlbW92ZXMgZXhwaXJlZCBlbnRyaWVzIGF1dG9tYXRpY2FsbHlcbiAgICAgKi9cbiAgICBzdGFydENhY2hlQ2xlYW51cCgpIHtcbiAgICAgICAgdGhpcy5jYWNoZUNsZWFudXBJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgICAgICBsZXQgY2xlYW5lZCA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGNhY2hlZF0gb2YgdGhpcy5jYWNoZS5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhZ2UgPSBub3cgLSBjYWNoZWQudGltZXN0YW1wO1xuICAgICAgICAgICAgICAgIGlmIChhZ2UgPj0gY2FjaGVkLnR0bCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhY2hlLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgICAgICAgICBjbGVhbmVkKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNsZWFuZWQgPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtQb3dlclNoZWxsU2VydmljZV0gQ2FjaGUgY2xlYW51cDogcmVtb3ZlZCAke2NsZWFuZWR9IGV4cGlyZWQgZW50cmllc2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzLmNvbmZpZy5jYWNoZUNsZWFudXBJbnRlcnZhbCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0b3AgY2FjaGUgY2xlYW51cCBpbnRlcnZhbFxuICAgICAqL1xuICAgIHN0b3BDYWNoZUNsZWFudXAoKSB7XG4gICAgICAgIGlmICh0aGlzLmNhY2hlQ2xlYW51cEludGVydmFsKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuY2FjaGVDbGVhbnVwSW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhpcy5jYWNoZUNsZWFudXBJbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGNhY2hlIHN0YXRpc3RpY3NcbiAgICAgKi9cbiAgICBnZXRDYWNoZVN0YXRpc3RpY3MoKSB7XG4gICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzaXplOiB0aGlzLmNhY2hlLnNpemUsXG4gICAgICAgICAgICBlbnRyaWVzOiBBcnJheS5mcm9tKHRoaXMuY2FjaGUuZW50cmllcygpKS5tYXAoKFtrZXksIGNhY2hlZF0pID0+ICh7XG4gICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgIGFnZTogbm93IC0gY2FjaGVkLnRpbWVzdGFtcCxcbiAgICAgICAgICAgICAgICB0dGw6IGNhY2hlZC50dGwsXG4gICAgICAgICAgICB9KSksXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFudXAgcmVzb3VyY2VzXG4gICAgICovXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy5zdG9wQ2FjaGVDbGVhbnVwKCk7XG4gICAgICAgIHRoaXMuY2xlYXJDYWNoZSgpO1xuICAgICAgICB0aGlzLnByb2dyZXNzQ2FsbGJhY2tzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMub3V0cHV0Q2FsbGJhY2tzLmNsZWFyKCk7XG4gICAgfVxufVxuLy8gRXhwb3J0IHNpbmdsZXRvbiBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IHBvd2VyU2hlbGxTZXJ2aWNlID0gbmV3IFBvd2VyU2hlbGxTZXJ2aWNlKCk7XG4vLyBFeHBvcnQgY2xhc3MgZm9yIGN1c3RvbSBpbnN0YW5jZXNcbmV4cG9ydCBkZWZhdWx0IFBvd2VyU2hlbGxTZXJ2aWNlO1xuIiwiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZU5vdGlmaWNhdGlvblN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlTm90aWZpY2F0aW9uU3RvcmUnO1xuaW1wb3J0IGV4cG9ydFNlcnZpY2UgZnJvbSAnLi4vc2VydmljZXMvZXhwb3J0U2VydmljZSc7XG5pbXBvcnQgeyBwb3dlclNoZWxsU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL3Bvd2VyU2hlbGxTZXJ2aWNlJztcbmltcG9ydCB7IHVzZVByb2ZpbGVTdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZVByb2ZpbGVTdG9yZSc7XG5leHBvcnQgY29uc3QgdXNlVXNlck1hbmFnZW1lbnRMb2dpYyA9ICgpID0+IHtcbiAgICBjb25zdCBbdXNlcnMsIHNldFVzZXJzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtzZWFyY2hRdWVyeSwgc2V0U2VhcmNoUXVlcnldID0gdXNlU3RhdGUoJycpO1xuICAgIGNvbnN0IFtyb2xlRmlsdGVyLCBzZXRSb2xlRmlsdGVyXSA9IHVzZVN0YXRlKCcnKTtcbiAgICBjb25zdCBbc3RhdHVzRmlsdGVyLCBzZXRTdGF0dXNGaWx0ZXJdID0gdXNlU3RhdGUoJycpO1xuICAgIGNvbnN0IFtzZWxlY3RlZFVzZXJzLCBzZXRTZWxlY3RlZFVzZXJzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbbG9hZGluZ01lc3NhZ2UsIHNldExvYWRpbmdNZXNzYWdlXSA9IHVzZVN0YXRlKCcnKTtcbiAgICBjb25zdCBbd2FybmluZ3MsIHNldFdhcm5pbmdzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCB7IGFkZE5vdGlmaWNhdGlvbiB9ID0gdXNlTm90aWZpY2F0aW9uU3RvcmUoKTtcbiAgICBjb25zdCB7IGdldEN1cnJlbnRTb3VyY2VQcm9maWxlIH0gPSB1c2VQcm9maWxlU3RvcmUoKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkVXNlcnMoKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgbG9hZFVzZXJzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgIHNldFdhcm5pbmdzKFtdKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNldExvYWRpbmdNZXNzYWdlKCdDaGVja2luZyBjYWNoZSBhbmQgZGF0YSBzb3VyY2VzLi4uJyk7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFByb2ZpbGUgPSBnZXRDdXJyZW50U291cmNlUHJvZmlsZSgpO1xuICAgICAgICAgICAgLy8gRmlyc3QgdHJ5IGNhY2hlZCBkYXRhIChtaXJyb3IgTG9naWNFbmdpbmVTZXJ2aWNlIHBhdHRlcm4pXG4gICAgICAgICAgICBsZXQgdXNlcnNEYXRhO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB1c2Vyc0RhdGEgPSBhd2FpdCBwb3dlclNoZWxsU2VydmljZS5nZXRDYWNoZWRSZXN1bHQoYGFwcF91c2Vyc18ke3NlbGVjdGVkUHJvZmlsZT8uaWQgfHwgJ2RlZmF1bHQnfWAsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2V0TG9hZGluZ01lc3NhZ2UoJ0xvYWRpbmcgYXBwbGljYXRpb24gdXNlcnMgZnJvbSBQb3dlclNoZWxsIG1vZHVsZXMuLi4nKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJ5IHRvIGV4ZWN1dGUgR2V0LUFwcGxpY2F0aW9uVXNlcnMgbW9kdWxlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHBvd2VyU2hlbGxTZXJ2aWNlLmV4ZWN1dGVNb2R1bGUoJ01vZHVsZXMvQWRtaW4vVXNlck1hbmFnZW1lbnQucHNtMScsICdHZXQtQXBwbGljYXRpb25Vc2VycycsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFByb2ZpbGVOYW1lOiBzZWxlY3RlZFByb2ZpbGU/LmNvbXBhbnlOYW1lIHx8ICdEZWZhdWx0JyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQuZGF0YT8udXNlcnMgfHwgW107XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAobW9kdWxlRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAvLyBGYWxsYmFjayB0byBDU1Ygc2VydmljZSAobWlycm9yIEMjIGZhbGxiYWNrIHBhdHRlcm4pXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdNb2R1bGUgZXhlY3V0aW9uIGZhaWxlZCwgZmFsbGluZyBiYWNrIHRvIENTVjonLCBtb2R1bGVFcnJvcik7XG4gICAgICAgICAgICAgICAgc2V0TG9hZGluZ01lc3NhZ2UoJ0xvYWRpbmcgdXNlcnMgZnJvbSBDU1YgZmlsZXMuLi4nKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjc3ZSZXN1bHQgPSBhd2FpdCBwb3dlclNoZWxsU2VydmljZS5leGVjdXRlU2NyaXB0KCdTY3JpcHRzL0dldC1BcHBVc2Vyc0Zyb21Dc3YucHMxJywgeyBQcm9maWxlUGF0aDogc2VsZWN0ZWRQcm9maWxlPy5kYXRhUGF0aCB8fCAnQzpcXFxcZGlzY292ZXJ5ZGF0YScgfSk7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJzRGF0YSA9IGNzdlJlc3VsdC5kYXRhPy51c2VycyB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gTWlycm9yIEMjIGhlYWRlciB3YXJuaW5nc1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3N2UmVzdWx0Lndhcm5pbmdzICYmIGNzdlJlc3VsdC53YXJuaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRXYXJuaW5ncyhjc3ZSZXN1bHQud2FybmluZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChjc3ZFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDU1YgZmFsbGJhY2sgYWxzbyBmYWlsZWQ6JywgY3N2RXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAvLyBVc2UgbW9jayBkYXRhIGFzIGxhc3QgcmVzb3J0XG4gICAgICAgICAgICAgICAgICAgIHVzZXJzRGF0YSA9IGdldE1vY2tVc2VycygpO1xuICAgICAgICAgICAgICAgICAgICBzZXRXYXJuaW5ncyhbJ1Bvd2VyU2hlbGwgZXhlY3V0aW9uIGZhaWxlZC4gVXNpbmcgbW9jayBkYXRhLiddKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRVc2Vycyh1c2Vyc0RhdGEpO1xuICAgICAgICAgICAgc2V0TG9hZGluZ01lc3NhZ2UoJycpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ2Vycm9yJywgdGl0bGU6ICdMb2FkIEZhaWxlZCcsIG1lc3NhZ2U6ICdGYWlsZWQgdG8gbG9hZCB1c2VycycsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHVzZXJzOicsIGVycm9yKTtcbiAgICAgICAgICAgIC8vIFVzZSBtb2NrIGRhdGEgb24gZXJyb3JcbiAgICAgICAgICAgIHNldFVzZXJzKGdldE1vY2tVc2VycygpKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgICAgICBzZXRMb2FkaW5nTWVzc2FnZSgnJyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGdldE1vY2tVc2VycyA9ICgpID0+IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICcxJyxcbiAgICAgICAgICAgIHVzZXJuYW1lOiAnYWRtaW4nLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdTeXN0ZW0gQWRtaW5pc3RyYXRvcicsXG4gICAgICAgICAgICBlbWFpbDogJ2FkbWluQGNvbXBhbnkuY29tJyxcbiAgICAgICAgICAgIHJvbGU6ICdBZG1pbmlzdHJhdG9yJyxcbiAgICAgICAgICAgIHN0YXR1czogJ0FjdGl2ZScsXG4gICAgICAgICAgICBsYXN0TG9naW46IG5ldyBEYXRlKCcyMDI1LTEwLTAzVDE0OjMwOjAwJyksXG4gICAgICAgICAgICBjcmVhdGVkRGF0ZTogbmV3IERhdGUoJzIwMjQtMDEtMDEnKSxcbiAgICAgICAgICAgIGNyZWF0ZWRCeTogJ3N5c3RlbScsXG4gICAgICAgICAgICBtb2RpZmllZERhdGU6IG5ldyBEYXRlKCcyMDI1LTEwLTAzJyksXG4gICAgICAgICAgICBtb2RpZmllZEJ5OiAnYWRtaW4nLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJzInLFxuICAgICAgICAgICAgdXNlcm5hbWU6ICdqc21pdGgnLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdKb2huIFNtaXRoJyxcbiAgICAgICAgICAgIGVtYWlsOiAnanNtaXRoQGNvbXBhbnkuY29tJyxcbiAgICAgICAgICAgIHJvbGU6ICdQb3dlclVzZXInLFxuICAgICAgICAgICAgc3RhdHVzOiAnQWN0aXZlJyxcbiAgICAgICAgICAgIGxhc3RMb2dpbjogbmV3IERhdGUoJzIwMjUtMTAtMDNUMTA6MTU6MDAnKSxcbiAgICAgICAgICAgIGNyZWF0ZWREYXRlOiBuZXcgRGF0ZSgnMjAyNC0wMy0xNScpLFxuICAgICAgICAgICAgY3JlYXRlZEJ5OiAnYWRtaW4nLFxuICAgICAgICAgICAgbW9kaWZpZWREYXRlOiBuZXcgRGF0ZSgnMjAyNS0wOS0yMCcpLFxuICAgICAgICAgICAgbW9kaWZpZWRCeTogJ2FkbWluJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICczJyxcbiAgICAgICAgICAgIHVzZXJuYW1lOiAnbWpvbmVzJyxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnTWFyeSBKb25lcycsXG4gICAgICAgICAgICBlbWFpbDogJ21qb25lc0Bjb21wYW55LmNvbScsXG4gICAgICAgICAgICByb2xlOiAnVXNlcicsXG4gICAgICAgICAgICBzdGF0dXM6ICdBY3RpdmUnLFxuICAgICAgICAgICAgbGFzdExvZ2luOiBuZXcgRGF0ZSgnMjAyNS0xMC0wMlQxNjo0NTowMCcpLFxuICAgICAgICAgICAgY3JlYXRlZERhdGU6IG5ldyBEYXRlKCcyMDI0LTA2LTAxJyksXG4gICAgICAgICAgICBjcmVhdGVkQnk6ICdhZG1pbicsXG4gICAgICAgICAgICBtb2RpZmllZERhdGU6IG5ldyBEYXRlKCcyMDI0LTA2LTAxJyksXG4gICAgICAgICAgICBtb2RpZmllZEJ5OiAnYWRtaW4nLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJzQnLFxuICAgICAgICAgICAgdXNlcm5hbWU6ICdyZGF2aXMnLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdSb2JlcnQgRGF2aXMnLFxuICAgICAgICAgICAgZW1haWw6ICdyZGF2aXNAY29tcGFueS5jb20nLFxuICAgICAgICAgICAgcm9sZTogJ1JlYWRPbmx5JyxcbiAgICAgICAgICAgIHN0YXR1czogJ0Rpc2FibGVkJyxcbiAgICAgICAgICAgIGxhc3RMb2dpbjogbmV3IERhdGUoJzIwMjUtMDktMTVUMDk6MDA6MDAnKSxcbiAgICAgICAgICAgIGNyZWF0ZWREYXRlOiBuZXcgRGF0ZSgnMjAyNC0wOC0xMCcpLFxuICAgICAgICAgICAgY3JlYXRlZEJ5OiAnYWRtaW4nLFxuICAgICAgICAgICAgbW9kaWZpZWREYXRlOiBuZXcgRGF0ZSgnMjAyNS0wOS0zMCcpLFxuICAgICAgICAgICAgbW9kaWZpZWRCeTogJ2FkbWluJyxcbiAgICAgICAgfSxcbiAgICBdO1xuICAgIGNvbnN0IGhhbmRsZUNyZWF0ZVVzZXIgPSAoKSA9PiB7XG4gICAgICAgIC8vIE9wZW4gY3JlYXRlIHVzZXIgZGlhbG9nXG4gICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdpbmZvJywgdGl0bGU6ICdDcmVhdGUgVXNlcicsIG1lc3NhZ2U6ICdDcmVhdGUgdXNlciBkaWFsb2cgd291bGQgb3BlbiBoZXJlJywgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlRWRpdFVzZXIgPSAodXNlcikgPT4ge1xuICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnaW5mbycsIHRpdGxlOiAnRWRpdCBVc2VyJywgbWVzc2FnZTogYEVkaXQgdXNlcjogJHt1c2VyLnVzZXJuYW1lfWAsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZURlbGV0ZVVzZXJzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoc2VsZWN0ZWRVc2Vycy5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBTaW11bGF0ZSBBUEkgY2FsbFxuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDUwMCkpO1xuICAgICAgICAgICAgc2V0VXNlcnMocHJldiA9PiBwcmV2LmZpbHRlcih1ID0+ICFzZWxlY3RlZFVzZXJzLmZpbmQocyA9PiBzLmlkID09PSB1LmlkKSkpO1xuICAgICAgICAgICAgc2V0U2VsZWN0ZWRVc2VycyhbXSk7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnc3VjY2VzcycsIHRpdGxlOiAnVXNlcnMgRGVsZXRlZCcsIG1lc3NhZ2U6IGBEZWxldGVkICR7c2VsZWN0ZWRVc2Vycy5sZW5ndGh9IHVzZXIocylgLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnZXJyb3InLCB0aXRsZTogJ0RlbGV0ZSBGYWlsZWQnLCBtZXNzYWdlOiAnRmFpbGVkIHRvIGRlbGV0ZSB1c2VycycsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlVG9nZ2xlVXNlclN0YXR1cyA9IGFzeW5jICh1c2VyKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBuZXdTdGF0dXMgPSB1c2VyLnN0YXR1cyA9PT0gJ0FjdGl2ZScgPyAnRGlzYWJsZWQnIDogJ0FjdGl2ZSc7XG4gICAgICAgICAgICBzZXRVc2VycyhwcmV2ID0+IHByZXYubWFwKHUgPT4gdS5pZCA9PT0gdXNlci5pZCA/IHsgLi4udSwgc3RhdHVzOiBuZXdTdGF0dXMgfSA6IHUpKTtcbiAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdzdWNjZXNzJywgdGl0bGU6ICdTdGF0dXMgVXBkYXRlZCcsIG1lc3NhZ2U6IGBVc2VyICR7bmV3U3RhdHVzLnRvTG93ZXJDYXNlKCl9YCwgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ2Vycm9yJywgdGl0bGU6ICdVcGRhdGUgRmFpbGVkJywgbWVzc2FnZTogJ0ZhaWxlZCB0byB1cGRhdGUgdXNlciBzdGF0dXMnLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZVJlc2V0UGFzc3dvcmQgPSBhc3luYyAodXNlcikgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDUwMCkpO1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ3N1Y2Nlc3MnLCB0aXRsZTogJ1Bhc3N3b3JkIFJlc2V0JywgbWVzc2FnZTogYFBhc3N3b3JkIHJlc2V0IGVtYWlsIHNlbnQgdG8gJHt1c2VyLmVtYWlsfWAsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdlcnJvcicsIHRpdGxlOiAnUmVzZXQgRmFpbGVkJywgbWVzc2FnZTogJ0ZhaWxlZCB0byByZXNldCBwYXNzd29yZCcsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlQXNzaWduUm9sZSA9IGFzeW5jICh1c2VyLCBuZXdSb2xlKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZXRVc2VycyhwcmV2ID0+IHByZXYubWFwKHUgPT4gdS5pZCA9PT0gdXNlci5pZCA/IHsgLi4udSwgcm9sZTogbmV3Um9sZSB9IDogdSkpO1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ3N1Y2Nlc3MnLCB0aXRsZTogJ1JvbGUgVXBkYXRlZCcsIG1lc3NhZ2U6IGBSb2xlIHVwZGF0ZWQgdG8gJHtuZXdSb2xlfWAsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdlcnJvcicsIHRpdGxlOiAnUm9sZSBBc3NpZ25tZW50IEZhaWxlZCcsIG1lc3NhZ2U6ICdGYWlsZWQgdG8gYXNzaWduIHJvbGUnLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUV4cG9ydCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkVXNlcnMgPSBnZXRGaWx0ZXJlZFVzZXJzKCk7XG4gICAgICAgICAgICBhd2FpdCBleHBvcnRTZXJ2aWNlLmV4cG9ydFRvRXhjZWwoZmlsdGVyZWRVc2VycywgJ1VzZXJzJyk7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnc3VjY2VzcycsIHRpdGxlOiAnRXhwb3J0IENvbXBsZXRlJywgbWVzc2FnZTogJ1VzZXJzIGV4cG9ydGVkIHN1Y2Nlc3NmdWxseScsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdlcnJvcicsIHRpdGxlOiAnRXhwb3J0IEZhaWxlZCcsIG1lc3NhZ2U6ICdGYWlsZWQgdG8gZXhwb3J0IHVzZXJzJywgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBnZXRGaWx0ZXJlZFVzZXJzID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gdXNlcnMuZmlsdGVyKHVzZXIgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlc1NlYXJjaCA9IHNlYXJjaFF1ZXJ5ID09PSAnJyB8fFxuICAgICAgICAgICAgICAgICh1c2VyLnVzZXJuYW1lID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFF1ZXJ5LnRvTG93ZXJDYXNlKCkpIHx8XG4gICAgICAgICAgICAgICAgKHVzZXIuZGlzcGxheU5hbWUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoUXVlcnkudG9Mb3dlckNhc2UoKSkgfHxcbiAgICAgICAgICAgICAgICAodXNlci5lbWFpbCA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hRdWVyeS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXNSb2xlID0gcm9sZUZpbHRlciA9PT0gJycgfHwgdXNlci5yb2xlID09PSByb2xlRmlsdGVyO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlc1N0YXR1cyA9IHN0YXR1c0ZpbHRlciA9PT0gJycgfHwgdXNlci5zdGF0dXMgPT09IHN0YXR1c0ZpbHRlcjtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaGVzU2VhcmNoICYmIG1hdGNoZXNSb2xlICYmIG1hdGNoZXNTdGF0dXM7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdXNlcnM6IGdldEZpbHRlcmVkVXNlcnMoKSxcbiAgICAgICAgaXNMb2FkaW5nLFxuICAgICAgICBzZWFyY2hRdWVyeSxcbiAgICAgICAgcm9sZUZpbHRlcixcbiAgICAgICAgc3RhdHVzRmlsdGVyLFxuICAgICAgICBzZWxlY3RlZFVzZXJzLFxuICAgICAgICBzZXRTZWFyY2hRdWVyeSxcbiAgICAgICAgc2V0Um9sZUZpbHRlcixcbiAgICAgICAgc2V0U3RhdHVzRmlsdGVyLFxuICAgICAgICBoYW5kbGVDcmVhdGVVc2VyLFxuICAgICAgICBoYW5kbGVFZGl0VXNlcixcbiAgICAgICAgaGFuZGxlRGVsZXRlVXNlcnMsXG4gICAgICAgIGhhbmRsZVRvZ2dsZVVzZXJTdGF0dXMsXG4gICAgICAgIGhhbmRsZVJlc2V0UGFzc3dvcmQsXG4gICAgICAgIGhhbmRsZUFzc2lnblJvbGUsXG4gICAgICAgIGhhbmRsZUV4cG9ydCxcbiAgICAgICAgbG9hZGluZ01lc3NhZ2UsXG4gICAgICAgIHdhcm5pbmdzLFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBVc2VyUGx1cywgVHJhc2gyLCBFZGl0MiwgU2hpZWxkLCBMb2NrLCBVbmxvY2sgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgVmlydHVhbGl6ZWREYXRhR3JpZCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgSW5wdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0lucHV0JztcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvU2VsZWN0JztcbmltcG9ydCB7IEJhZGdlIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CYWRnZSc7XG5pbXBvcnQgeyB1c2VVc2VyTWFuYWdlbWVudExvZ2ljIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlVXNlck1hbmFnZW1lbnRMb2dpYyc7XG5leHBvcnQgY29uc3QgVXNlck1hbmFnZW1lbnRWaWV3ID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgdXNlcnMsIGlzTG9hZGluZywgc2VhcmNoUXVlcnksIHJvbGVGaWx0ZXIsIHN0YXR1c0ZpbHRlciwgc2VsZWN0ZWRVc2Vycywgc2V0U2VhcmNoUXVlcnksIHNldFJvbGVGaWx0ZXIsIHNldFN0YXR1c0ZpbHRlciwgaGFuZGxlQ3JlYXRlVXNlciwgaGFuZGxlRWRpdFVzZXIsIGhhbmRsZURlbGV0ZVVzZXJzLCBoYW5kbGVUb2dnbGVVc2VyU3RhdHVzLCBoYW5kbGVSZXNldFBhc3N3b3JkLCBoYW5kbGVBc3NpZ25Sb2xlLCBoYW5kbGVFeHBvcnQsIH0gPSB1c2VVc2VyTWFuYWdlbWVudExvZ2ljKCk7XG4gICAgY29uc3QgY29sdW1ucyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICd1c2VybmFtZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnVXNlcm5hbWUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1RleHRDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgZmxleDogMSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdkaXNwbGF5TmFtZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGlzcGxheSBOYW1lJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZW1haWwnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0VtYWlsJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAncm9sZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUm9sZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnU2V0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4gKF9qc3goQmFkZ2UsIHsgdmFyaWFudDogcGFyYW1zLnZhbHVlID09PSAnQWRtaW5pc3RyYXRvcicgPyAnZGFuZ2VyJyA6IHBhcmFtcy52YWx1ZSA9PT0gJ1Bvd2VyVXNlcicgPyAnd2FybmluZycgOiAnaW5mbycsIGNoaWxkcmVuOiBwYXJhbXMudmFsdWUgfSkpLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3N0YXR1cycsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnU3RhdHVzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdTZXRDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiAocGFyYW1zKSA9PiAoX2pzeChCYWRnZSwgeyB2YXJpYW50OiBwYXJhbXMudmFsdWUgPT09ICdBY3RpdmUnID8gJ3N1Y2Nlc3MnIDogJ2RlZmF1bHQnLCBjaGlsZHJlbjogcGFyYW1zLnZhbHVlIH0pKSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdsYXN0TG9naW4nLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0xhc3QgTG9naW4nLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ0RhdGVDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKSA6ICdOZXZlcicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnY3JlYXRlZERhdGUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0NyZWF0ZWQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ0RhdGVDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnYWN0aW9ucycsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQWN0aW9ucycsXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICBmaWx0ZXI6IGZhbHNlLFxuICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiAocGFyYW1zKSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgaWNvbjogX2pzeChFZGl0Miwge30pLCBvbkNsaWNrOiAoKSA9PiBoYW5kbGVFZGl0VXNlcihwYXJhbXMuZGF0YSksIFwiYXJpYS1sYWJlbFwiOiBcIkVkaXQgdXNlclwiLCBjaGlsZHJlbjogXCJFZGl0XCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogcGFyYW1zLmRhdGEuc3RhdHVzID09PSAnQWN0aXZlJyA/ICdzZWNvbmRhcnknIDogJ3ByaW1hcnknLCBpY29uOiBwYXJhbXMuZGF0YS5zdGF0dXMgPT09ICdBY3RpdmUnID8gX2pzeChMb2NrLCB7fSkgOiBfanN4KFVubG9jaywge30pLCBvbkNsaWNrOiAoKSA9PiBoYW5kbGVUb2dnbGVVc2VyU3RhdHVzKHBhcmFtcy5kYXRhKSwgXCJhcmlhLWxhYmVsXCI6IHBhcmFtcy5kYXRhLnN0YXR1cyA9PT0gJ0FjdGl2ZScgPyAnRGlzYWJsZSB1c2VyJyA6ICdFbmFibGUgdXNlcicsIGNoaWxkcmVuOiBwYXJhbXMuZGF0YS5zdGF0dXMgPT09ICdBY3RpdmUnID8gJ0Rpc2FibGUnIDogJ0VuYWJsZScgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgaWNvbjogX2pzeChTaGllbGQsIHt9KSwgb25DbGljazogKCkgPT4gaGFuZGxlUmVzZXRQYXNzd29yZChwYXJhbXMuZGF0YSksIFwiYXJpYS1sYWJlbFwiOiBcIlJlc2V0IHBhc3N3b3JkXCIsIGNoaWxkcmVuOiBcIlJlc2V0XCIgfSldIH0pKSxcbiAgICAgICAgfSxcbiAgICBdO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBmbGV4LWNvbCBoLWZ1bGwgcC02IHNwYWNlLXktNlwiLCBcImRhdGEtdGVzdGlkXCI6IFwidXNlci1tYW5hZ2VtZW50LXZpZXdcIiwgXCJkYXRhLWN5XCI6IFwidXNlci1tYW5hZ2VtZW50LXZpZXdcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJVc2VyIE1hbmFnZW1lbnRcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMCBtdC0xXCIsIGNoaWxkcmVuOiBcIk1hbmFnZSBhcHBsaWNhdGlvbiB1c2Vycywgcm9sZXMsIGFuZCBwZXJtaXNzaW9uc1wiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBpY29uOiBfanN4KFVzZXJQbHVzLCB7fSksIG9uQ2xpY2s6IGhhbmRsZUNyZWF0ZVVzZXIsIGNoaWxkcmVuOiBcIkNyZWF0ZSBVc2VyXCIgfSksIF9qc3hzKEJ1dHRvbiwgeyB2YXJpYW50OiBcImRhbmdlclwiLCBpY29uOiBfanN4KFRyYXNoMiwge30pLCBvbkNsaWNrOiBoYW5kbGVEZWxldGVVc2VycywgZGlzYWJsZWQ6IChzZWxlY3RlZFVzZXJzID8/IFtdKS5sZW5ndGggPT09IDAsIGNoaWxkcmVuOiBbXCJEZWxldGUgU2VsZWN0ZWQgKFwiLCAoc2VsZWN0ZWRVc2VycyA/PyBbXSkubGVuZ3RoLCBcIilcIl0gfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBnYXAtNCBpdGVtcy1lbmRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMVwiLCBjaGlsZHJlbjogX2pzeChJbnB1dCwgeyBsYWJlbDogXCJTZWFyY2ggVXNlcnNcIiwgdmFsdWU6IHNlYXJjaFF1ZXJ5LCBvbkNoYW5nZTogKGUpID0+IHNldFNlYXJjaFF1ZXJ5KGUudGFyZ2V0LnZhbHVlKSwgcGxhY2Vob2xkZXI6IFwiU2VhcmNoIGJ5IHVzZXJuYW1lLCBlbWFpbCwgb3IgbmFtZS4uLlwiIH0pIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInctNDhcIiwgY2hpbGRyZW46IF9qc3goU2VsZWN0LCB7IGxhYmVsOiBcIlJvbGVcIiwgdmFsdWU6IHJvbGVGaWx0ZXIsIG9uQ2hhbmdlOiAodmFsdWUpID0+IHNldFJvbGVGaWx0ZXIodmFsdWUpLCBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6IFwiXCIsIGxhYmVsOiBcIkFsbCBSb2xlc1wiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6IFwiQWRtaW5pc3RyYXRvclwiLCBsYWJlbDogXCJBZG1pbmlzdHJhdG9yXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogXCJQb3dlclVzZXJcIiwgbGFiZWw6IFwiUG93ZXIgVXNlclwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6IFwiVXNlclwiLCBsYWJlbDogXCJVc2VyXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogXCJSZWFkT25seVwiLCBsYWJlbDogXCJSZWFkIE9ubHlcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gfSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy00OFwiLCBjaGlsZHJlbjogX2pzeChTZWxlY3QsIHsgbGFiZWw6IFwiU3RhdHVzXCIsIHZhbHVlOiBzdGF0dXNGaWx0ZXIsIG9uQ2hhbmdlOiAodmFsdWUpID0+IHNldFN0YXR1c0ZpbHRlcih2YWx1ZSksIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogXCJcIiwgbGFiZWw6IFwiQWxsIFN0YXR1c2VzXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogXCJBY3RpdmVcIiwgbGFiZWw6IFwiQWN0aXZlXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogXCJEaXNhYmxlZFwiLCBsYWJlbDogXCJEaXNhYmxlZFwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6IFwiTG9ja2VkXCIsIGxhYmVsOiBcIkxvY2tlZFwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSB9KSB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgb25DbGljazogaGFuZGxlRXhwb3J0LCBjaGlsZHJlbjogXCJFeHBvcnRcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTQgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1ibHVlLTUwIGRhcms6YmctYmx1ZS05MDAvMjAgcC00IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ibHVlLTIwMCBkYXJrOmJvcmRlci1ibHVlLTgwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWJsdWUtNjAwIGRhcms6dGV4dC1ibHVlLTQwMFwiLCBjaGlsZHJlbjogXCJUb3RhbCBVc2Vyc1wiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWJsdWUtOTAwIGRhcms6dGV4dC1ibHVlLTEwMFwiLCBjaGlsZHJlbjogKHVzZXJzID8/IFtdKS5sZW5ndGggfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1ncmVlbi01MCBkYXJrOmJnLWdyZWVuLTkwMC8yMCBwLTQgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyZWVuLTIwMCBkYXJrOmJvcmRlci1ncmVlbi04MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmVlbi02MDAgZGFyazp0ZXh0LWdyZWVuLTQwMFwiLCBjaGlsZHJlbjogXCJBY3RpdmVcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmVlbi05MDAgZGFyazp0ZXh0LWdyZWVuLTEwMFwiLCBjaGlsZHJlbjogKHVzZXJzID8/IFtdKS5maWx0ZXIodSA9PiB1LnN0YXR1cyA9PT0gJ0FjdGl2ZScpLmxlbmd0aCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXllbGxvdy01MCBkYXJrOmJnLXllbGxvdy05MDAvMjAgcC00IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci15ZWxsb3ctMjAwIGRhcms6Ym9yZGVyLXllbGxvdy04MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC15ZWxsb3ctNjAwIGRhcms6dGV4dC15ZWxsb3ctNDAwXCIsIGNoaWxkcmVuOiBcIkFkbWluaXN0cmF0b3JzXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQteWVsbG93LTkwMCBkYXJrOnRleHQteWVsbG93LTEwMFwiLCBjaGlsZHJlbjogKHVzZXJzID8/IFtdKS5maWx0ZXIodSA9PiB1LnJvbGUgPT09ICdBZG1pbmlzdHJhdG9yJykubGVuZ3RoIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctcmVkLTUwIGRhcms6YmctcmVkLTkwMC8yMCBwLTQgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXJlZC0yMDAgZGFyazpib3JkZXItcmVkLTgwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDBcIiwgY2hpbGRyZW46IFwiRGlzYWJsZWRcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1yZWQtOTAwIGRhcms6dGV4dC1yZWQtMTAwXCIsIGNoaWxkcmVuOiAodXNlcnMgPz8gW10pLmZpbHRlcih1ID0+IHUuc3RhdHVzID09PSAnRGlzYWJsZWQnKS5sZW5ndGggfSldIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTFcIiwgY2hpbGRyZW46IF9qc3goVmlydHVhbGl6ZWREYXRhR3JpZCwgeyBkYXRhOiB1c2VycywgY29sdW1uczogY29sdW1ucywgbG9hZGluZzogaXNMb2FkaW5nIH0pIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgVXNlck1hbmFnZW1lbnRWaWV3O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9