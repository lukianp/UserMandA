"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[1923],{

/***/ 21923:
/*!*********************************************************************!*\
  !*** ./src/renderer/views/admin/UserManagementView.tsx + 2 modules ***!
  \*********************************************************************/
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
        const api = (0,electron_api_fallback.getElectronAPI)();
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
        const api = (0,electron_api_fallback.getElectronAPI)();
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
        const api = (0,electron_api_fallback.getElectronAPI)();
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
        const api = (0,electron_api_fallback.getElectronAPI)();
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
    const { addNotification } = (0,useNotificationStore.useNotificationStore)();
    const { getCurrentSourceProfile } = (0,useProfileStore.useProfileStore)();
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
            await exportService["default"].exportToExcel(filteredUsers, 'Users');
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
            cellRenderer: (params) => ((0,jsx_runtime.jsx)(Badge.Badge, { variant: params.value === 'Administrator' ? 'danger' : params.value === 'PowerUser' ? 'warning' : 'info', children: params.value })),
        },
        {
            field: 'status',
            headerName: 'Status',
            sortable: true,
            filter: 'agSetColumnFilter',
            cellRenderer: (params) => ((0,jsx_runtime.jsx)(Badge.Badge, { variant: params.value === 'Active' ? 'success' : 'default', children: params.value })),
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
            cellRenderer: (params) => ((0,jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [(0,jsx_runtime.jsx)(Button.Button, { size: "sm", variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react.Edit2, {}), onClick: () => handleEditUser(params.data), "aria-label": "Edit user", children: "Edit" }), (0,jsx_runtime.jsx)(Button.Button, { size: "sm", variant: params.data.status === 'Active' ? 'secondary' : 'primary', icon: params.data.status === 'Active' ? (0,jsx_runtime.jsx)(lucide_react.Lock, {}) : (0,jsx_runtime.jsx)(lucide_react.Unlock, {}), onClick: () => handleToggleUserStatus(params.data), "aria-label": params.data.status === 'Active' ? 'Disable user' : 'Enable user', children: params.data.status === 'Active' ? 'Disable' : 'Enable' }), (0,jsx_runtime.jsx)(Button.Button, { size: "sm", variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react.Shield, {}), onClick: () => handleResetPassword(params.data), "aria-label": "Reset password", children: "Reset" })] })),
        },
    ];
    return ((0,jsx_runtime.jsxs)("div", { className: "flex flex-col h-full p-6 space-y-6", "data-testid": "user-management-view", "data-cy": "user-management-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between items-center", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "User Management" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: "Manage application users, roles, and permissions" })] }), (0,jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [(0,jsx_runtime.jsx)(Button.Button, { variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react.UserPlus, {}), onClick: handleCreateUser, children: "Create User" }), (0,jsx_runtime.jsxs)(Button.Button, { variant: "danger", icon: (0,jsx_runtime.jsx)(lucide_react.Trash2, {}), onClick: handleDeleteUsers, disabled: (selectedUsers ?? []).length === 0, children: ["Delete Selected (", (selectedUsers ?? []).length, ")"] })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex gap-4 items-end", children: [(0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(Input.Input, { label: "Search Users", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search by username, email, or name..." }) }), (0,jsx_runtime.jsx)("div", { className: "w-48", children: (0,jsx_runtime.jsx)(Select.Select, { label: "Role", value: roleFilter, onChange: (value) => setRoleFilter(value), options: [
                                { value: "", label: "All Roles" },
                                { value: "Administrator", label: "Administrator" },
                                { value: "PowerUser", label: "Power User" },
                                { value: "User", label: "User" },
                                { value: "ReadOnly", label: "Read Only" },
                            ] }) }), (0,jsx_runtime.jsx)("div", { className: "w-48", children: (0,jsx_runtime.jsx)(Select.Select, { label: "Status", value: statusFilter, onChange: (value) => setStatusFilter(value), options: [
                                { value: "", label: "All Statuses" },
                                { value: "Active", label: "Active" },
                                { value: "Disabled", label: "Disabled" },
                                { value: "Locked", label: "Locked" },
                            ] }) }), (0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", onClick: handleExport, children: "Export" })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-4 gap-4", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-blue-600 dark:text-blue-400", children: "Total Users" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-blue-900 dark:text-blue-100", children: (users ?? []).length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-green-600 dark:text-green-400", children: "Active" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-green-900 dark:text-green-100", children: (users ?? []).filter(u => u.status === 'Active').length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-yellow-600 dark:text-yellow-400", children: "Administrators" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-yellow-900 dark:text-yellow-100", children: (users ?? []).filter(u => u.role === 'Administrator').length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-red-600 dark:text-red-400", children: "Disabled" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-red-900 dark:text-red-100", children: (users ?? []).filter(u => u.status === 'Disabled').length })] })] }), (0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid.VirtualizedDataGrid, { data: users, columns: columns, loading: isLoading }) })] }));
};
/* harmony default export */ const admin_UserManagementView = (UserManagementView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUErQixHQUFHLEdBQUcsbUJBQUksQ0FBQyxhQUFNLElBQUksaUVBQWlFLElBQUksR0FBRyxvQkFBSyxVQUFVLGdEQUFnRCxvQkFBSyxVQUFVLG1IQUFtSCxtQkFBSSxVQUFVLGdGQUFnRixHQUFHLG1CQUFJLFVBQVUsa0dBQWtHLElBQUksR0FBRyxvQkFBSyxVQUFVLHVIQUF1SCxtQkFBSSxVQUFVLDZFQUE2RSxHQUFHLG1CQUFJLFVBQVUsdUlBQXVJLElBQUksR0FBRyxvQkFBSyxVQUFVLDJIQUEySCxtQkFBSSxVQUFVLHVGQUF1RixHQUFHLG1CQUFJLFVBQVUsOElBQThJLElBQUksR0FBRyxvQkFBSyxVQUFVLCtHQUErRyxtQkFBSSxVQUFVLDJFQUEyRSxHQUFHLG1CQUFJLFVBQVUscUlBQXFJLElBQUksSUFBSSxHQUFHLG1CQUFJLFVBQVUsK0JBQStCLG1CQUFJLENBQUMsdUNBQW1CLElBQUksbURBQW1ELEdBQUcsSUFBSTtBQUNyeUQ7QUFDQSwrREFBZSxrQkFBa0IsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3NlcnZpY2VzL3Bvd2VyU2hlbGxTZXJ2aWNlLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZVVzZXJNYW5hZ2VtZW50TG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdmlld3MvYWRtaW4vVXNlck1hbmFnZW1lbnRWaWV3LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFJlbmRlcmVyLXNpZGUgUG93ZXJTaGVsbCBTZXJ2aWNlXG4gKlxuICogTWlycm9ycyBDIyBDc3ZEYXRhU2VydmljZU5ldyBhbmQgTG9naWNFbmdpbmVTZXJ2aWNlIHBhdHRlcm5zIHdpdGg6XG4gKiAtIFNlc3Npb24tYmFzZWQgY2FjaGluZyB3aXRoIFRUTCAoVGltZSBUbyBMaXZlKVxuICogLSBBdXRvbWF0aWMgY2FjaGUgaW52YWxpZGF0aW9uXG4gKiAtIFByb2dyZXNzIHJlcG9ydGluZ1xuICogLSBDYW5jZWxsYXRpb24gc3VwcG9ydFxuICogLSBGYWxsYmFjayBtZWNoYW5pc21zXG4gKiAtIFNjcmlwdCBhbmQgbW9kdWxlIGV4ZWN1dGlvblxuICpcbiAqIFRoaXMgc2VydmljZSBhY3RzIGFzIGEgY2xpZW50LXNpZGUgd3JhcHBlciBhcm91bmQgdGhlIEVsZWN0cm9uIElQQyBQb3dlclNoZWxsIGV4ZWN1dGlvbi5cbiAqL1xuaW1wb3J0IHsgZ2V0RWxlY3Ryb25BUEkgfSBmcm9tICcuLi9saWIvZWxlY3Ryb24tYXBpLWZhbGxiYWNrJztcbi8qKlxuICogUG93ZXJTaGVsbCBTZXJ2aWNlIC0gQ2xpZW50LXNpZGUgd3JhcHBlciBmb3IgUG93ZXJTaGVsbCBleGVjdXRpb25cbiAqXG4gKiBNaXJyb3JzIEMjIHBhdHRlcm5zIGZyb206XG4gKiAtIEdVSS9TZXJ2aWNlcy9Dc3ZEYXRhU2VydmljZU5ldy5jc1xuICogLSBHVUkvU2VydmljZXMvTG9naWNFbmdpbmVTZXJ2aWNlLmNzXG4gKiAtIEdVSS9TZXJ2aWNlcy9Qb3dlclNoZWxsRXhlY3V0b3IuY3NcbiAqL1xuZXhwb3J0IGNsYXNzIFBvd2VyU2hlbGxTZXJ2aWNlIHtcbiAgICBjYWNoZSA9IG5ldyBNYXAoKTtcbiAgICBjb25maWc7XG4gICAgY2FjaGVDbGVhbnVwSW50ZXJ2YWwgPSBudWxsO1xuICAgIHByb2dyZXNzQ2FsbGJhY2tzID0gbmV3IE1hcCgpO1xuICAgIG91dHB1dENhbGxiYWNrcyA9IG5ldyBNYXAoKTtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgICAgICBkZWZhdWx0Q2FjaGVUVEw6IDMwMDAwMCwgLy8gNSBtaW51dGVzIGxpa2UgQyNcbiAgICAgICAgICAgIGVuYWJsZUNhY2hlQ2xlYW51cDogdHJ1ZSxcbiAgICAgICAgICAgIGNhY2hlQ2xlYW51cEludGVydmFsOiA2MDAwMCwgLy8gMSBtaW51dGVcbiAgICAgICAgICAgIG1heENhY2hlU2l6ZTogMTAwLFxuICAgICAgICAgICAgLi4uY29uZmlnLFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5jb25maWcuZW5hYmxlQ2FjaGVDbGVhbnVwKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0Q2FjaGVDbGVhbnVwKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2V0dXAgSVBDIGV2ZW50IGxpc3RlbmVycyBmb3IgcHJvZ3Jlc3MgYW5kIG91dHB1dFxuICAgICAgICB0aGlzLnNldHVwRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0dXAgZXZlbnQgbGlzdGVuZXJzIGZvciBQb3dlclNoZWxsIGV4ZWN1dGlvbiBldmVudHNcbiAgICAgKiBNaXJyb3JzIEMjIGV2ZW50IGhhbmRsaW5nIHBhdHRlcm5zXG4gICAgICovXG4gICAgc2V0dXBFdmVudExpc3RlbmVycygpIHtcbiAgICAgICAgY29uc3QgYXBpID0gZ2V0RWxlY3Ryb25BUEkoKTtcbiAgICAgICAgaWYgKCFhcGkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIC8vIFByb2dyZXNzIGV2ZW50c1xuICAgICAgICBpZiAoYXBpLm9uUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIGFwaS5vblByb2dyZXNzKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLnByb2dyZXNzQ2FsbGJhY2tzLmdldChkYXRhLmV4ZWN1dGlvbklkKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3V0cHV0IGV2ZW50cyAtIGhhbmRsZSBhbGwgNiBQb3dlclNoZWxsIHN0cmVhbXNcbiAgICAgICAgaWYgKGFwaS5vbk91dHB1dFN0cmVhbSkge1xuICAgICAgICAgICAgYXBpLm9uT3V0cHV0U3RyZWFtKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLm91dHB1dENhbGxiYWNrcy5nZXQoZGF0YS5leGVjdXRpb25JZCk7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhcGkub25FcnJvclN0cmVhbSkge1xuICAgICAgICAgICAgYXBpLm9uRXJyb3JTdHJlYW0oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYWxsYmFjayA9IHRoaXMub3V0cHV0Q2FsbGJhY2tzLmdldChkYXRhLmV4ZWN1dGlvbklkKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFwaS5vbldhcm5pbmdTdHJlYW0pIHtcbiAgICAgICAgICAgIGFwaS5vbldhcm5pbmdTdHJlYW0oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYWxsYmFjayA9IHRoaXMub3V0cHV0Q2FsbGJhY2tzLmdldChkYXRhLmV4ZWN1dGlvbklkKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFwaS5vblZlcmJvc2VTdHJlYW0pIHtcbiAgICAgICAgICAgIGFwaS5vblZlcmJvc2VTdHJlYW0oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYWxsYmFjayA9IHRoaXMub3V0cHV0Q2FsbGJhY2tzLmdldChkYXRhLmV4ZWN1dGlvbklkKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFwaS5vbkRlYnVnU3RyZWFtKSB7XG4gICAgICAgICAgICBhcGkub25EZWJ1Z1N0cmVhbSgoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gdGhpcy5vdXRwdXRDYWxsYmFja3MuZ2V0KGRhdGEuZXhlY3V0aW9uSWQpO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXBpLm9uSW5mb3JtYXRpb25TdHJlYW0pIHtcbiAgICAgICAgICAgIGFwaS5vbkluZm9ybWF0aW9uU3RyZWFtKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzLm91dHB1dENhbGxiYWNrcy5nZXQoZGF0YS5leGVjdXRpb25JZCk7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYSBQb3dlclNoZWxsIHNjcmlwdFxuICAgICAqIE1pcnJvcnMgQyMgQ3N2RGF0YVNlcnZpY2VOZXcuTG9hZFVzZXJzQXN5bmMgcGF0dGVyblxuICAgICAqXG4gICAgICogQHBhcmFtIHNjcmlwdFBhdGggUGF0aCB0byBQb3dlclNoZWxsIHNjcmlwdCBmaWxlXG4gICAgICogQHBhcmFtIHBhcmFtZXRlcnMgU2NyaXB0IHBhcmFtZXRlcnNcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyBFeGVjdXRpb24gb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2aW5nIHRvIGV4ZWN1dGlvbiByZXN1bHRcbiAgICAgKi9cbiAgICBhc3luYyBleGVjdXRlU2NyaXB0KHNjcmlwdFBhdGgsIHBhcmFtZXRlcnMgPSB7fSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGFwaSA9IGdldEVsZWN0cm9uQVBJKCk7XG4gICAgICAgIC8vIEJ1aWxkIHNjcmlwdCBhcmd1bWVudHMgZnJvbSBwYXJhbWV0ZXJzIChtaXJyb3JzIEMjIHBhcmFtZXRlciBidWlsZGluZylcbiAgICAgICAgY29uc3QgYXJncyA9IE9iamVjdC5lbnRyaWVzKHBhcmFtZXRlcnMpLm1hcCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgPyBgLSR7a2V5fWAgOiAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBgLSR7a2V5fWA7XG4gICAgICAgIH0pLmZpbHRlcihCb29sZWFuKTtcbiAgICAgICAgLy8gQWRkIHBhcmFtZXRlciB2YWx1ZXNcbiAgICAgICAgT2JqZWN0LmVudHJpZXMocGFyYW1ldGVycykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goU3RyaW5nKHZhbHVlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgICAgICBzY3JpcHRQYXRoLFxuICAgICAgICAgICAgYXJncyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiBvcHRpb25zLnRpbWVvdXQgfHwgdGhpcy5jb25maWcuZGVmYXVsdENhY2hlVFRMLFxuICAgICAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuOiBvcHRpb25zLmNhbmNlbGxhdGlvblRva2VuIHx8IHdpbmRvdy5jcnlwdG8ucmFuZG9tVVVJRCgpLFxuICAgICAgICAgICAgICAgIHN0cmVhbU91dHB1dDogb3B0aW9ucy5zdHJlYW1PdXRwdXQgIT09IGZhbHNlLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLmV4ZWN1dGVTY3JpcHQocGFyYW1zKTtcbiAgICAgICAgICAgIC8vIFZhbGlkYXRlIHJlc3VsdCBzdHJ1Y3R1cmUgbGlrZSBDIyBkb2VzXG4gICAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCAnUG93ZXJTaGVsbCBleGVjdXRpb24gZmFpbGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgUG93ZXJTaGVsbCBzY3JpcHQgZXhlY3V0aW9uIGZhaWxlZDogJHtzY3JpcHRQYXRofWAsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYSBQb3dlclNoZWxsIG1vZHVsZSBmdW5jdGlvblxuICAgICAqIE1pcnJvcnMgQyMgTG9naWNFbmdpbmVTZXJ2aWNlLkdldFVzZXJzQXN5bmMgcGF0dGVyblxuICAgICAqXG4gICAgICogQHBhcmFtIG1vZHVsZVBhdGggUGF0aCB0byBQb3dlclNoZWxsIG1vZHVsZVxuICAgICAqIEBwYXJhbSBmdW5jdGlvbk5hbWUgRnVuY3Rpb24gbmFtZSB0byBpbnZva2VcbiAgICAgKiBAcGFyYW0gcGFyYW1ldGVycyBGdW5jdGlvbiBwYXJhbWV0ZXJzXG4gICAgICogQHBhcmFtIG9wdGlvbnMgRXhlY3V0aW9uIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byBleGVjdXRpb24gcmVzdWx0XG4gICAgICovXG4gICAgYXN5bmMgZXhlY3V0ZU1vZHVsZShtb2R1bGVQYXRoLCBmdW5jdGlvbk5hbWUsIHBhcmFtZXRlcnMgPSB7fSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGFwaSA9IGdldEVsZWN0cm9uQVBJKCk7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgICAgIG1vZHVsZVBhdGgsXG4gICAgICAgICAgICBmdW5jdGlvbk5hbWUsXG4gICAgICAgICAgICBwYXJhbWV0ZXJzLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IG9wdGlvbnMudGltZW91dCB8fCB0aGlzLmNvbmZpZy5kZWZhdWx0Q2FjaGVUVEwsXG4gICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IG9wdGlvbnMuY2FuY2VsbGF0aW9uVG9rZW4gfHwgd2luZG93LmNyeXB0by5yYW5kb21VVUlEKCksXG4gICAgICAgICAgICAgICAgc3RyZWFtT3V0cHV0OiBvcHRpb25zLnN0cmVhbU91dHB1dCAhPT0gZmFsc2UsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkuZXhlY3V0ZU1vZHVsZShwYXJhbXMpO1xuICAgICAgICAgICAgLy8gVmFsaWRhdGUgcmVzdWx0IHN0cnVjdHVyZSBsaWtlIEMjIGRvZXNcbiAgICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8ICdQb3dlclNoZWxsIG1vZHVsZSBleGVjdXRpb24gZmFpbGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgUG93ZXJTaGVsbCBtb2R1bGUgZXhlY3V0aW9uIGZhaWxlZDogJHttb2R1bGVQYXRofToke2Z1bmN0aW9uTmFtZX1gLCBlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgY2FjaGVkIHJlc3VsdCBvciBleGVjdXRlIGZ1bmN0aW9uIHRvIGZldGNoIG5ldyBkYXRhXG4gICAgICogTWlycm9ycyBDIyBMb2dpY0VuZ2luZVNlcnZpY2UgY2FjaGluZyBwYXR0ZXJuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2FjaGVLZXkgVW5pcXVlIGNhY2hlIGtleVxuICAgICAqIEBwYXJhbSBmZXRjaEZ1bmN0aW9uIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgaWYgY2FjaGUgbWlzc1xuICAgICAqIEBwYXJhbSB0dGwgT3B0aW9uYWwgY3VzdG9tIFRUTCBpbiBtaWxsaXNlY29uZHNcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byBjYWNoZWQgb3IgZnJlc2ggZGF0YVxuICAgICAqL1xuICAgIGFzeW5jIGdldENhY2hlZFJlc3VsdChjYWNoZUtleSwgZmV0Y2hGdW5jdGlvbiwgdHRsKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIHdlIGhhdmUgYSB2YWxpZCBjYWNoZWQgcmVzdWx0XG4gICAgICAgIGNvbnN0IGNhY2hlZCA9IHRoaXMuY2FjaGUuZ2V0KGNhY2hlS2V5KTtcbiAgICAgICAgaWYgKGNhY2hlZCkge1xuICAgICAgICAgICAgY29uc3QgYWdlID0gRGF0ZS5ub3coKSAtIGNhY2hlZC50aW1lc3RhbXA7XG4gICAgICAgICAgICBpZiAoYWdlIDwgY2FjaGVkLnR0bCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUG93ZXJTaGVsbFNlcnZpY2VdIENhY2hlIEhJVCBmb3Iga2V5OiAke2NhY2hlS2V5fSAoYWdlOiAke2FnZX1tcylgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FjaGVkLmRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Bvd2VyU2hlbGxTZXJ2aWNlXSBDYWNoZSBFWFBJUkVEIGZvciBrZXk6ICR7Y2FjaGVLZXl9IChhZ2U6ICR7YWdlfW1zLCB0dGw6ICR7Y2FjaGVkLnR0bH1tcylgKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhY2hlLmRlbGV0ZShjYWNoZUtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW1Bvd2VyU2hlbGxTZXJ2aWNlXSBDYWNoZSBNSVNTIGZvciBrZXk6ICR7Y2FjaGVLZXl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2FjaGUgbWlzcyBvciBleHBpcmVkIC0gZmV0Y2ggZnJlc2ggZGF0YVxuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBmZXRjaEZ1bmN0aW9uKCk7XG4gICAgICAgIC8vIFN0b3JlIGluIGNhY2hlXG4gICAgICAgIHRoaXMuY2FjaGUuc2V0KGNhY2hlS2V5LCB7XG4gICAgICAgICAgICBkYXRhOiByZXN1bHQsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksXG4gICAgICAgICAgICB0dGw6IHR0bCB8fCB0aGlzLmNvbmZpZy5kZWZhdWx0Q2FjaGVUVEwsXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBFbmZvcmNlIG1heCBjYWNoZSBzaXplIChMUlUgZXZpY3Rpb24gLSByZW1vdmUgb2xkZXN0IGVudHJ5KVxuICAgICAgICBpZiAodGhpcy5jYWNoZS5zaXplID4gdGhpcy5jb25maWcubWF4Q2FjaGVTaXplKSB7XG4gICAgICAgICAgICBjb25zdCBvbGRlc3RLZXkgPSBBcnJheS5mcm9tKHRoaXMuY2FjaGUuZW50cmllcygpKVxuICAgICAgICAgICAgICAgIC5zb3J0KChbLCBhXSwgWywgYl0pID0+IGEudGltZXN0YW1wIC0gYi50aW1lc3RhbXApWzBdWzBdO1xuICAgICAgICAgICAgdGhpcy5jYWNoZS5kZWxldGUob2xkZXN0S2V5KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUG93ZXJTaGVsbFNlcnZpY2VdIENhY2hlIHNpemUgbGltaXQgcmVhY2hlZCwgZXZpY3RlZDogJHtvbGRlc3RLZXl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW52YWxpZGF0ZSBjYWNoZSBlbnRyeSBieSBrZXlcbiAgICAgKiBAcGFyYW0gY2FjaGVLZXkgQ2FjaGUga2V5IHRvIGludmFsaWRhdGVcbiAgICAgKi9cbiAgICBpbnZhbGlkYXRlQ2FjaGUoY2FjaGVLZXkpIHtcbiAgICAgICAgY29uc3QgZGVsZXRlZCA9IHRoaXMuY2FjaGUuZGVsZXRlKGNhY2hlS2V5KTtcbiAgICAgICAgaWYgKGRlbGV0ZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUG93ZXJTaGVsbFNlcnZpY2VdIENhY2hlIGludmFsaWRhdGVkOiAke2NhY2hlS2V5fWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEludmFsaWRhdGUgYWxsIGNhY2hlIGVudHJpZXMgbWF0Y2hpbmcgYSBwcmVmaXhcbiAgICAgKiBAcGFyYW0gcHJlZml4IEtleSBwcmVmaXggdG8gbWF0Y2hcbiAgICAgKi9cbiAgICBpbnZhbGlkYXRlQ2FjaGVCeVByZWZpeChwcmVmaXgpIHtcbiAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdGhpcy5jYWNoZS5rZXlzKCkpIHtcbiAgICAgICAgICAgIGlmIChrZXkuc3RhcnRzV2l0aChwcmVmaXgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZS5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGBbUG93ZXJTaGVsbFNlcnZpY2VdIENhY2hlIGludmFsaWRhdGVkICR7Y291bnR9IGVudHJpZXMgd2l0aCBwcmVmaXg6ICR7cHJlZml4fWApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbGVhciBhbGwgY2FjaGUgZW50cmllc1xuICAgICAqL1xuICAgIGNsZWFyQ2FjaGUoKSB7XG4gICAgICAgIGNvbnN0IHNpemUgPSB0aGlzLmNhY2hlLnNpemU7XG4gICAgICAgIHRoaXMuY2FjaGUuY2xlYXIoKTtcbiAgICAgICAgY29uc29sZS5sb2coYFtQb3dlclNoZWxsU2VydmljZV0gQ2FjaGUgY2xlYXJlZCAoJHtzaXplfSBlbnRyaWVzIHJlbW92ZWQpYCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGEgcHJvZ3Jlc3MgY2FsbGJhY2sgZm9yIGEgc3BlY2lmaWMgZXhlY3V0aW9uXG4gICAgICogQHBhcmFtIGV4ZWN1dGlvbklkIEV4ZWN1dGlvbiBJRFxuICAgICAqIEBwYXJhbSBjYWxsYmFjayBQcm9ncmVzcyBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqIEByZXR1cm5zIENsZWFudXAgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBvblByb2dyZXNzKGV4ZWN1dGlvbklkLCBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLnByb2dyZXNzQ2FsbGJhY2tzLnNldChleGVjdXRpb25JZCwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcm9ncmVzc0NhbGxiYWNrcy5kZWxldGUoZXhlY3V0aW9uSWQpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBhbiBvdXRwdXQgY2FsbGJhY2sgZm9yIGEgc3BlY2lmaWMgZXhlY3V0aW9uXG4gICAgICogQHBhcmFtIGV4ZWN1dGlvbklkIEV4ZWN1dGlvbiBJRFxuICAgICAqIEBwYXJhbSBjYWxsYmFjayBPdXRwdXQgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKiBAcmV0dXJucyBDbGVhbnVwIGZ1bmN0aW9uXG4gICAgICovXG4gICAgb25PdXRwdXQoZXhlY3V0aW9uSWQsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMub3V0cHV0Q2FsbGJhY2tzLnNldChleGVjdXRpb25JZCwgY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vdXRwdXRDYWxsYmFja3MuZGVsZXRlKGV4ZWN1dGlvbklkKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FuY2VsIGEgcnVubmluZyBQb3dlclNoZWxsIGV4ZWN1dGlvblxuICAgICAqIEBwYXJhbSBjYW5jZWxsYXRpb25Ub2tlbiBDYW5jZWxsYXRpb24gdG9rZW5cbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmluZyB0byB0cnVlIGlmIGNhbmNlbGxlZCBzdWNjZXNzZnVsbHlcbiAgICAgKi9cbiAgICBhc3luYyBjYW5jZWxFeGVjdXRpb24oY2FuY2VsbGF0aW9uVG9rZW4pIHtcbiAgICAgICAgY29uc3QgYXBpID0gZ2V0RWxlY3Ryb25BUEkoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNhbmNlbGxlZCA9IGF3YWl0IGFwaS5jYW5jZWxFeGVjdXRpb24oY2FuY2VsbGF0aW9uVG9rZW4pO1xuICAgICAgICAgICAgaWYgKGNhbmNlbGxlZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUG93ZXJTaGVsbFNlcnZpY2VdIEV4ZWN1dGlvbiBjYW5jZWxsZWQ6ICR7Y2FuY2VsbGF0aW9uVG9rZW59YCk7XG4gICAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAgY2FsbGJhY2tzXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9ncmVzc0NhbGxiYWNrcy5kZWxldGUoY2FuY2VsbGF0aW9uVG9rZW4pO1xuICAgICAgICAgICAgICAgIHRoaXMub3V0cHV0Q2FsbGJhY2tzLmRlbGV0ZShjYW5jZWxsYXRpb25Ub2tlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2FuY2VsbGVkO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIGNhbmNlbCBleGVjdXRpb246ICR7Y2FuY2VsbGF0aW9uVG9rZW59YCwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0YXJ0IHBlcmlvZGljIGNhY2hlIGNsZWFudXBcbiAgICAgKiBSZW1vdmVzIGV4cGlyZWQgZW50cmllcyBhdXRvbWF0aWNhbGx5XG4gICAgICovXG4gICAgc3RhcnRDYWNoZUNsZWFudXAoKSB7XG4gICAgICAgIHRoaXMuY2FjaGVDbGVhbnVwSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgbGV0IGNsZWFuZWQgPSAwO1xuICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCBjYWNoZWRdIG9mIHRoaXMuY2FjaGUuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWdlID0gbm93IC0gY2FjaGVkLnRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICBpZiAoYWdlID49IGNhY2hlZC50dGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWNoZS5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgY2xlYW5lZCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjbGVhbmVkID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUG93ZXJTaGVsbFNlcnZpY2VdIENhY2hlIGNsZWFudXA6IHJlbW92ZWQgJHtjbGVhbmVkfSBleHBpcmVkIGVudHJpZXNgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcy5jb25maWcuY2FjaGVDbGVhbnVwSW50ZXJ2YWwpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdG9wIGNhY2hlIGNsZWFudXAgaW50ZXJ2YWxcbiAgICAgKi9cbiAgICBzdG9wQ2FjaGVDbGVhbnVwKCkge1xuICAgICAgICBpZiAodGhpcy5jYWNoZUNsZWFudXBJbnRlcnZhbCkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmNhY2hlQ2xlYW51cEludGVydmFsKTtcbiAgICAgICAgICAgIHRoaXMuY2FjaGVDbGVhbnVwSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBjYWNoZSBzdGF0aXN0aWNzXG4gICAgICovXG4gICAgZ2V0Q2FjaGVTdGF0aXN0aWNzKCkge1xuICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2l6ZTogdGhpcy5jYWNoZS5zaXplLFxuICAgICAgICAgICAgZW50cmllczogQXJyYXkuZnJvbSh0aGlzLmNhY2hlLmVudHJpZXMoKSkubWFwKChba2V5LCBjYWNoZWRdKSA9PiAoe1xuICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICBhZ2U6IG5vdyAtIGNhY2hlZC50aW1lc3RhbXAsXG4gICAgICAgICAgICAgICAgdHRsOiBjYWNoZWQudHRsLFxuICAgICAgICAgICAgfSkpLFxuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbGVhbnVwIHJlc291cmNlc1xuICAgICAqL1xuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMuc3RvcENhY2hlQ2xlYW51cCgpO1xuICAgICAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcbiAgICAgICAgdGhpcy5wcm9ncmVzc0NhbGxiYWNrcy5jbGVhcigpO1xuICAgICAgICB0aGlzLm91dHB1dENhbGxiYWNrcy5jbGVhcigpO1xuICAgIH1cbn1cbi8vIEV4cG9ydCBzaW5nbGV0b24gaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBwb3dlclNoZWxsU2VydmljZSA9IG5ldyBQb3dlclNoZWxsU2VydmljZSgpO1xuLy8gRXhwb3J0IGNsYXNzIGZvciBjdXN0b20gaW5zdGFuY2VzXG5leHBvcnQgZGVmYXVsdCBQb3dlclNoZWxsU2VydmljZTtcbiIsImltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VOb3RpZmljYXRpb25TdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZU5vdGlmaWNhdGlvblN0b3JlJztcbmltcG9ydCBleHBvcnRTZXJ2aWNlIGZyb20gJy4uL3NlcnZpY2VzL2V4cG9ydFNlcnZpY2UnO1xuaW1wb3J0IHsgcG93ZXJTaGVsbFNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9wb3dlclNoZWxsU2VydmljZSc7XG5pbXBvcnQgeyB1c2VQcm9maWxlU3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VQcm9maWxlU3RvcmUnO1xuZXhwb3J0IGNvbnN0IHVzZVVzZXJNYW5hZ2VtZW50TG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgW3VzZXJzLCBzZXRVc2Vyc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbc2VhcmNoUXVlcnksIHNldFNlYXJjaFF1ZXJ5XSA9IHVzZVN0YXRlKCcnKTtcbiAgICBjb25zdCBbcm9sZUZpbHRlciwgc2V0Um9sZUZpbHRlcl0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW3N0YXR1c0ZpbHRlciwgc2V0U3RhdHVzRmlsdGVyXSA9IHVzZVN0YXRlKCcnKTtcbiAgICBjb25zdCBbc2VsZWN0ZWRVc2Vycywgc2V0U2VsZWN0ZWRVc2Vyc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW2xvYWRpbmdNZXNzYWdlLCBzZXRMb2FkaW5nTWVzc2FnZV0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW3dhcm5pbmdzLCBzZXRXYXJuaW5nc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgeyBhZGROb3RpZmljYXRpb24gfSA9IHVzZU5vdGlmaWNhdGlvblN0b3JlKCk7XG4gICAgY29uc3QgeyBnZXRDdXJyZW50U291cmNlUHJvZmlsZSB9ID0gdXNlUHJvZmlsZVN0b3JlKCk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZFVzZXJzKCk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IGxvYWRVc2VycyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICBzZXRXYXJuaW5ncyhbXSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZXRMb2FkaW5nTWVzc2FnZSgnQ2hlY2tpbmcgY2FjaGUgYW5kIGRhdGEgc291cmNlcy4uLicpO1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRQcm9maWxlID0gZ2V0Q3VycmVudFNvdXJjZVByb2ZpbGUoKTtcbiAgICAgICAgICAgIC8vIEZpcnN0IHRyeSBjYWNoZWQgZGF0YSAobWlycm9yIExvZ2ljRW5naW5lU2VydmljZSBwYXR0ZXJuKVxuICAgICAgICAgICAgbGV0IHVzZXJzRGF0YTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdXNlcnNEYXRhID0gYXdhaXQgcG93ZXJTaGVsbFNlcnZpY2UuZ2V0Q2FjaGVkUmVzdWx0KGBhcHBfdXNlcnNfJHtzZWxlY3RlZFByb2ZpbGU/LmlkIHx8ICdkZWZhdWx0J31gLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldExvYWRpbmdNZXNzYWdlKCdMb2FkaW5nIGFwcGxpY2F0aW9uIHVzZXJzIGZyb20gUG93ZXJTaGVsbCBtb2R1bGVzLi4uJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRyeSB0byBleGVjdXRlIEdldC1BcHBsaWNhdGlvblVzZXJzIG1vZHVsZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBwb3dlclNoZWxsU2VydmljZS5leGVjdXRlTW9kdWxlKCdNb2R1bGVzL0FkbWluL1VzZXJNYW5hZ2VtZW50LnBzbTEnLCAnR2V0LUFwcGxpY2F0aW9uVXNlcnMnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBQcm9maWxlTmFtZTogc2VsZWN0ZWRQcm9maWxlPy5jb21wYW55TmFtZSB8fCAnRGVmYXVsdCcsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LmRhdGE/LnVzZXJzIHx8IFtdO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKG1vZHVsZUVycm9yKSB7XG4gICAgICAgICAgICAgICAgLy8gRmFsbGJhY2sgdG8gQ1NWIHNlcnZpY2UgKG1pcnJvciBDIyBmYWxsYmFjayBwYXR0ZXJuKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTW9kdWxlIGV4ZWN1dGlvbiBmYWlsZWQsIGZhbGxpbmcgYmFjayB0byBDU1Y6JywgbW9kdWxlRXJyb3IpO1xuICAgICAgICAgICAgICAgIHNldExvYWRpbmdNZXNzYWdlKCdMb2FkaW5nIHVzZXJzIGZyb20gQ1NWIGZpbGVzLi4uJyk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY3N2UmVzdWx0ID0gYXdhaXQgcG93ZXJTaGVsbFNlcnZpY2UuZXhlY3V0ZVNjcmlwdCgnU2NyaXB0cy9HZXQtQXBwVXNlcnNGcm9tQ3N2LnBzMScsIHsgUHJvZmlsZVBhdGg6IHNlbGVjdGVkUHJvZmlsZT8uZGF0YVBhdGggfHwgJ0M6XFxcXGRpc2NvdmVyeWRhdGEnIH0pO1xuICAgICAgICAgICAgICAgICAgICB1c2Vyc0RhdGEgPSBjc3ZSZXN1bHQuZGF0YT8udXNlcnMgfHwgW107XG4gICAgICAgICAgICAgICAgICAgIC8vIE1pcnJvciBDIyBoZWFkZXIgd2FybmluZ3NcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNzdlJlc3VsdC53YXJuaW5ncyAmJiBjc3ZSZXN1bHQud2FybmluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0V2FybmluZ3MoY3N2UmVzdWx0Lndhcm5pbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoY3N2RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ1NWIGZhbGxiYWNrIGFsc28gZmFpbGVkOicsIGNzdkVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gVXNlIG1vY2sgZGF0YSBhcyBsYXN0IHJlc29ydFxuICAgICAgICAgICAgICAgICAgICB1c2Vyc0RhdGEgPSBnZXRNb2NrVXNlcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgc2V0V2FybmluZ3MoWydQb3dlclNoZWxsIGV4ZWN1dGlvbiBmYWlsZWQuIFVzaW5nIG1vY2sgZGF0YS4nXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0VXNlcnModXNlcnNEYXRhKTtcbiAgICAgICAgICAgIHNldExvYWRpbmdNZXNzYWdlKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdlcnJvcicsIHRpdGxlOiAnTG9hZCBGYWlsZWQnLCBtZXNzYWdlOiAnRmFpbGVkIHRvIGxvYWQgdXNlcnMnLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCB1c2VyczonLCBlcnJvcik7XG4gICAgICAgICAgICAvLyBVc2UgbW9jayBkYXRhIG9uIGVycm9yXG4gICAgICAgICAgICBzZXRVc2VycyhnZXRNb2NrVXNlcnMoKSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgc2V0TG9hZGluZ01lc3NhZ2UoJycpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBnZXRNb2NrVXNlcnMgPSAoKSA9PiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnMScsXG4gICAgICAgICAgICB1c2VybmFtZTogJ2FkbWluJyxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnU3lzdGVtIEFkbWluaXN0cmF0b3InLFxuICAgICAgICAgICAgZW1haWw6ICdhZG1pbkBjb21wYW55LmNvbScsXG4gICAgICAgICAgICByb2xlOiAnQWRtaW5pc3RyYXRvcicsXG4gICAgICAgICAgICBzdGF0dXM6ICdBY3RpdmUnLFxuICAgICAgICAgICAgbGFzdExvZ2luOiBuZXcgRGF0ZSgnMjAyNS0xMC0wM1QxNDozMDowMCcpLFxuICAgICAgICAgICAgY3JlYXRlZERhdGU6IG5ldyBEYXRlKCcyMDI0LTAxLTAxJyksXG4gICAgICAgICAgICBjcmVhdGVkQnk6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgbW9kaWZpZWREYXRlOiBuZXcgRGF0ZSgnMjAyNS0xMC0wMycpLFxuICAgICAgICAgICAgbW9kaWZpZWRCeTogJ2FkbWluJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICcyJyxcbiAgICAgICAgICAgIHVzZXJuYW1lOiAnanNtaXRoJyxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnSm9obiBTbWl0aCcsXG4gICAgICAgICAgICBlbWFpbDogJ2pzbWl0aEBjb21wYW55LmNvbScsXG4gICAgICAgICAgICByb2xlOiAnUG93ZXJVc2VyJyxcbiAgICAgICAgICAgIHN0YXR1czogJ0FjdGl2ZScsXG4gICAgICAgICAgICBsYXN0TG9naW46IG5ldyBEYXRlKCcyMDI1LTEwLTAzVDEwOjE1OjAwJyksXG4gICAgICAgICAgICBjcmVhdGVkRGF0ZTogbmV3IERhdGUoJzIwMjQtMDMtMTUnKSxcbiAgICAgICAgICAgIGNyZWF0ZWRCeTogJ2FkbWluJyxcbiAgICAgICAgICAgIG1vZGlmaWVkRGF0ZTogbmV3IERhdGUoJzIwMjUtMDktMjAnKSxcbiAgICAgICAgICAgIG1vZGlmaWVkQnk6ICdhZG1pbicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnMycsXG4gICAgICAgICAgICB1c2VybmFtZTogJ21qb25lcycsXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJ01hcnkgSm9uZXMnLFxuICAgICAgICAgICAgZW1haWw6ICdtam9uZXNAY29tcGFueS5jb20nLFxuICAgICAgICAgICAgcm9sZTogJ1VzZXInLFxuICAgICAgICAgICAgc3RhdHVzOiAnQWN0aXZlJyxcbiAgICAgICAgICAgIGxhc3RMb2dpbjogbmV3IERhdGUoJzIwMjUtMTAtMDJUMTY6NDU6MDAnKSxcbiAgICAgICAgICAgIGNyZWF0ZWREYXRlOiBuZXcgRGF0ZSgnMjAyNC0wNi0wMScpLFxuICAgICAgICAgICAgY3JlYXRlZEJ5OiAnYWRtaW4nLFxuICAgICAgICAgICAgbW9kaWZpZWREYXRlOiBuZXcgRGF0ZSgnMjAyNC0wNi0wMScpLFxuICAgICAgICAgICAgbW9kaWZpZWRCeTogJ2FkbWluJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICc0JyxcbiAgICAgICAgICAgIHVzZXJuYW1lOiAncmRhdmlzJyxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnUm9iZXJ0IERhdmlzJyxcbiAgICAgICAgICAgIGVtYWlsOiAncmRhdmlzQGNvbXBhbnkuY29tJyxcbiAgICAgICAgICAgIHJvbGU6ICdSZWFkT25seScsXG4gICAgICAgICAgICBzdGF0dXM6ICdEaXNhYmxlZCcsXG4gICAgICAgICAgICBsYXN0TG9naW46IG5ldyBEYXRlKCcyMDI1LTA5LTE1VDA5OjAwOjAwJyksXG4gICAgICAgICAgICBjcmVhdGVkRGF0ZTogbmV3IERhdGUoJzIwMjQtMDgtMTAnKSxcbiAgICAgICAgICAgIGNyZWF0ZWRCeTogJ2FkbWluJyxcbiAgICAgICAgICAgIG1vZGlmaWVkRGF0ZTogbmV3IERhdGUoJzIwMjUtMDktMzAnKSxcbiAgICAgICAgICAgIG1vZGlmaWVkQnk6ICdhZG1pbicsXG4gICAgICAgIH0sXG4gICAgXTtcbiAgICBjb25zdCBoYW5kbGVDcmVhdGVVc2VyID0gKCkgPT4ge1xuICAgICAgICAvLyBPcGVuIGNyZWF0ZSB1c2VyIGRpYWxvZ1xuICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnaW5mbycsIHRpdGxlOiAnQ3JlYXRlIFVzZXInLCBtZXNzYWdlOiAnQ3JlYXRlIHVzZXIgZGlhbG9nIHdvdWxkIG9wZW4gaGVyZScsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUVkaXRVc2VyID0gKHVzZXIpID0+IHtcbiAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ2luZm8nLCB0aXRsZTogJ0VkaXQgVXNlcicsIG1lc3NhZ2U6IGBFZGl0IHVzZXI6ICR7dXNlci51c2VybmFtZX1gLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVEZWxldGVVc2VycyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKHNlbGVjdGVkVXNlcnMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gU2ltdWxhdGUgQVBJIGNhbGxcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCA1MDApKTtcbiAgICAgICAgICAgIHNldFVzZXJzKHByZXYgPT4gcHJldi5maWx0ZXIodSA9PiAhc2VsZWN0ZWRVc2Vycy5maW5kKHMgPT4gcy5pZCA9PT0gdS5pZCkpKTtcbiAgICAgICAgICAgIHNldFNlbGVjdGVkVXNlcnMoW10pO1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ3N1Y2Nlc3MnLCB0aXRsZTogJ1VzZXJzIERlbGV0ZWQnLCBtZXNzYWdlOiBgRGVsZXRlZCAke3NlbGVjdGVkVXNlcnMubGVuZ3RofSB1c2VyKHMpYCwgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ2Vycm9yJywgdGl0bGU6ICdEZWxldGUgRmFpbGVkJywgbWVzc2FnZTogJ0ZhaWxlZCB0byBkZWxldGUgdXNlcnMnLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZVRvZ2dsZVVzZXJTdGF0dXMgPSBhc3luYyAodXNlcikgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbmV3U3RhdHVzID0gdXNlci5zdGF0dXMgPT09ICdBY3RpdmUnID8gJ0Rpc2FibGVkJyA6ICdBY3RpdmUnO1xuICAgICAgICAgICAgc2V0VXNlcnMocHJldiA9PiBwcmV2Lm1hcCh1ID0+IHUuaWQgPT09IHVzZXIuaWQgPyB7IC4uLnUsIHN0YXR1czogbmV3U3RhdHVzIH0gOiB1KSk7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnc3VjY2VzcycsIHRpdGxlOiAnU3RhdHVzIFVwZGF0ZWQnLCBtZXNzYWdlOiBgVXNlciAke25ld1N0YXR1cy50b0xvd2VyQ2FzZSgpfWAsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdlcnJvcicsIHRpdGxlOiAnVXBkYXRlIEZhaWxlZCcsIG1lc3NhZ2U6ICdGYWlsZWQgdG8gdXBkYXRlIHVzZXIgc3RhdHVzJywgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVSZXNldFBhc3N3b3JkID0gYXN5bmMgKHVzZXIpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCA1MDApKTtcbiAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdzdWNjZXNzJywgdGl0bGU6ICdQYXNzd29yZCBSZXNldCcsIG1lc3NhZ2U6IGBQYXNzd29yZCByZXNldCBlbWFpbCBzZW50IHRvICR7dXNlci5lbWFpbH1gLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnZXJyb3InLCB0aXRsZTogJ1Jlc2V0IEZhaWxlZCcsIG1lc3NhZ2U6ICdGYWlsZWQgdG8gcmVzZXQgcGFzc3dvcmQnLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUFzc2lnblJvbGUgPSBhc3luYyAodXNlciwgbmV3Um9sZSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2V0VXNlcnMocHJldiA9PiBwcmV2Lm1hcCh1ID0+IHUuaWQgPT09IHVzZXIuaWQgPyB7IC4uLnUsIHJvbGU6IG5ld1JvbGUgfSA6IHUpKTtcbiAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdzdWNjZXNzJywgdGl0bGU6ICdSb2xlIFVwZGF0ZWQnLCBtZXNzYWdlOiBgUm9sZSB1cGRhdGVkIHRvICR7bmV3Um9sZX1gLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnZXJyb3InLCB0aXRsZTogJ1JvbGUgQXNzaWdubWVudCBGYWlsZWQnLCBtZXNzYWdlOiAnRmFpbGVkIHRvIGFzc2lnbiByb2xlJywgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVFeHBvcnQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZFVzZXJzID0gZ2V0RmlsdGVyZWRVc2VycygpO1xuICAgICAgICAgICAgYXdhaXQgZXhwb3J0U2VydmljZS5leHBvcnRUb0V4Y2VsKGZpbHRlcmVkVXNlcnMsICdVc2VycycpO1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ3N1Y2Nlc3MnLCB0aXRsZTogJ0V4cG9ydCBDb21wbGV0ZScsIG1lc3NhZ2U6ICdVc2VycyBleHBvcnRlZCBzdWNjZXNzZnVsbHknLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnZXJyb3InLCB0aXRsZTogJ0V4cG9ydCBGYWlsZWQnLCBtZXNzYWdlOiAnRmFpbGVkIHRvIGV4cG9ydCB1c2VycycsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgZ2V0RmlsdGVyZWRVc2VycyA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHVzZXJzLmZpbHRlcih1c2VyID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXNTZWFyY2ggPSBzZWFyY2hRdWVyeSA9PT0gJycgfHxcbiAgICAgICAgICAgICAgICAodXNlci51c2VybmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hRdWVyeS50b0xvd2VyQ2FzZSgpKSB8fFxuICAgICAgICAgICAgICAgICh1c2VyLmRpc3BsYXlOYW1lID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFF1ZXJ5LnRvTG93ZXJDYXNlKCkpIHx8XG4gICAgICAgICAgICAgICAgKHVzZXIuZW1haWwgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoUXVlcnkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzUm9sZSA9IHJvbGVGaWx0ZXIgPT09ICcnIHx8IHVzZXIucm9sZSA9PT0gcm9sZUZpbHRlcjtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXNTdGF0dXMgPSBzdGF0dXNGaWx0ZXIgPT09ICcnIHx8IHVzZXIuc3RhdHVzID09PSBzdGF0dXNGaWx0ZXI7XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hlc1NlYXJjaCAmJiBtYXRjaGVzUm9sZSAmJiBtYXRjaGVzU3RhdHVzO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiB7XG4gICAgICAgIHVzZXJzOiBnZXRGaWx0ZXJlZFVzZXJzKCksXG4gICAgICAgIGlzTG9hZGluZyxcbiAgICAgICAgc2VhcmNoUXVlcnksXG4gICAgICAgIHJvbGVGaWx0ZXIsXG4gICAgICAgIHN0YXR1c0ZpbHRlcixcbiAgICAgICAgc2VsZWN0ZWRVc2VycyxcbiAgICAgICAgc2V0U2VhcmNoUXVlcnksXG4gICAgICAgIHNldFJvbGVGaWx0ZXIsXG4gICAgICAgIHNldFN0YXR1c0ZpbHRlcixcbiAgICAgICAgaGFuZGxlQ3JlYXRlVXNlcixcbiAgICAgICAgaGFuZGxlRWRpdFVzZXIsXG4gICAgICAgIGhhbmRsZURlbGV0ZVVzZXJzLFxuICAgICAgICBoYW5kbGVUb2dnbGVVc2VyU3RhdHVzLFxuICAgICAgICBoYW5kbGVSZXNldFBhc3N3b3JkLFxuICAgICAgICBoYW5kbGVBc3NpZ25Sb2xlLFxuICAgICAgICBoYW5kbGVFeHBvcnQsXG4gICAgICAgIGxvYWRpbmdNZXNzYWdlLFxuICAgICAgICB3YXJuaW5ncyxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgVXNlclBsdXMsIFRyYXNoMiwgRWRpdDIsIFNoaWVsZCwgTG9jaywgVW5sb2NrIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IFZpcnR1YWxpemVkRGF0YUdyaWQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9JbnB1dCc7XG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL1NlbGVjdCc7XG5pbXBvcnQgeyBCYWRnZSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQmFkZ2UnO1xuaW1wb3J0IHsgdXNlVXNlck1hbmFnZW1lbnRMb2dpYyB9IGZyb20gJy4uLy4uL2hvb2tzL3VzZVVzZXJNYW5hZ2VtZW50TG9naWMnO1xuZXhwb3J0IGNvbnN0IFVzZXJNYW5hZ2VtZW50VmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IHVzZXJzLCBpc0xvYWRpbmcsIHNlYXJjaFF1ZXJ5LCByb2xlRmlsdGVyLCBzdGF0dXNGaWx0ZXIsIHNlbGVjdGVkVXNlcnMsIHNldFNlYXJjaFF1ZXJ5LCBzZXRSb2xlRmlsdGVyLCBzZXRTdGF0dXNGaWx0ZXIsIGhhbmRsZUNyZWF0ZVVzZXIsIGhhbmRsZUVkaXRVc2VyLCBoYW5kbGVEZWxldGVVc2VycywgaGFuZGxlVG9nZ2xlVXNlclN0YXR1cywgaGFuZGxlUmVzZXRQYXNzd29yZCwgaGFuZGxlQXNzaWduUm9sZSwgaGFuZGxlRXhwb3J0LCB9ID0gdXNlVXNlck1hbmFnZW1lbnRMb2dpYygpO1xuICAgIGNvbnN0IGNvbHVtbnMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAndXNlcm5hbWUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1VzZXJuYW1lJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZGlzcGxheU5hbWUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0Rpc3BsYXkgTmFtZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICBmbGV4OiAxLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2VtYWlsJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdFbWFpbCcsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICBmbGV4OiAxLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3JvbGUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1JvbGUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1NldENvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IChfanN4KEJhZGdlLCB7IHZhcmlhbnQ6IHBhcmFtcy52YWx1ZSA9PT0gJ0FkbWluaXN0cmF0b3InID8gJ2RhbmdlcicgOiBwYXJhbXMudmFsdWUgPT09ICdQb3dlclVzZXInID8gJ3dhcm5pbmcnIDogJ2luZm8nLCBjaGlsZHJlbjogcGFyYW1zLnZhbHVlIH0pKSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdzdGF0dXMnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1N0YXR1cycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnU2V0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4gKF9qc3goQmFkZ2UsIHsgdmFyaWFudDogcGFyYW1zLnZhbHVlID09PSAnQWN0aXZlJyA/ICdzdWNjZXNzJyA6ICdkZWZhdWx0JywgY2hpbGRyZW46IHBhcmFtcy52YWx1ZSB9KSksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnbGFzdExvZ2luJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdMYXN0IExvZ2luJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdEYXRlQ29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyBuZXcgRGF0ZShwYXJhbXMudmFsdWUpLnRvTG9jYWxlU3RyaW5nKCkgOiAnTmV2ZXInLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2NyZWF0ZWREYXRlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDcmVhdGVkJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdEYXRlQ29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBuZXcgRGF0ZShwYXJhbXMudmFsdWUpLnRvTG9jYWxlRGF0ZVN0cmluZygpLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2FjdGlvbnMnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0FjdGlvbnMnLFxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZmlsdGVyOiBmYWxzZSxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIGljb246IF9qc3goRWRpdDIsIHt9KSwgb25DbGljazogKCkgPT4gaGFuZGxlRWRpdFVzZXIocGFyYW1zLmRhdGEpLCBcImFyaWEtbGFiZWxcIjogXCJFZGl0IHVzZXJcIiwgY2hpbGRyZW46IFwiRWRpdFwiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IHBhcmFtcy5kYXRhLnN0YXR1cyA9PT0gJ0FjdGl2ZScgPyAnc2Vjb25kYXJ5JyA6ICdwcmltYXJ5JywgaWNvbjogcGFyYW1zLmRhdGEuc3RhdHVzID09PSAnQWN0aXZlJyA/IF9qc3goTG9jaywge30pIDogX2pzeChVbmxvY2ssIHt9KSwgb25DbGljazogKCkgPT4gaGFuZGxlVG9nZ2xlVXNlclN0YXR1cyhwYXJhbXMuZGF0YSksIFwiYXJpYS1sYWJlbFwiOiBwYXJhbXMuZGF0YS5zdGF0dXMgPT09ICdBY3RpdmUnID8gJ0Rpc2FibGUgdXNlcicgOiAnRW5hYmxlIHVzZXInLCBjaGlsZHJlbjogcGFyYW1zLmRhdGEuc3RhdHVzID09PSAnQWN0aXZlJyA/ICdEaXNhYmxlJyA6ICdFbmFibGUnIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIGljb246IF9qc3goU2hpZWxkLCB7fSksIG9uQ2xpY2s6ICgpID0+IGhhbmRsZVJlc2V0UGFzc3dvcmQocGFyYW1zLmRhdGEpLCBcImFyaWEtbGFiZWxcIjogXCJSZXNldCBwYXNzd29yZFwiLCBjaGlsZHJlbjogXCJSZXNldFwiIH0pXSB9KSksXG4gICAgICAgIH0sXG4gICAgXTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZmxleC1jb2wgaC1mdWxsIHAtNiBzcGFjZS15LTZcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInVzZXItbWFuYWdlbWVudC12aWV3XCIsIFwiZGF0YS1jeVwiOiBcInVzZXItbWFuYWdlbWVudC12aWV3XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJoMVwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IFwiVXNlciBNYW5hZ2VtZW50XCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtMVwiLCBjaGlsZHJlbjogXCJNYW5hZ2UgYXBwbGljYXRpb24gdXNlcnMsIHJvbGVzLCBhbmQgcGVybWlzc2lvbnNcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgaWNvbjogX2pzeChVc2VyUGx1cywge30pLCBvbkNsaWNrOiBoYW5kbGVDcmVhdGVVc2VyLCBjaGlsZHJlbjogXCJDcmVhdGUgVXNlclwiIH0pLCBfanN4cyhCdXR0b24sIHsgdmFyaWFudDogXCJkYW5nZXJcIiwgaWNvbjogX2pzeChUcmFzaDIsIHt9KSwgb25DbGljazogaGFuZGxlRGVsZXRlVXNlcnMsIGRpc2FibGVkOiAoc2VsZWN0ZWRVc2VycyA/PyBbXSkubGVuZ3RoID09PSAwLCBjaGlsZHJlbjogW1wiRGVsZXRlIFNlbGVjdGVkIChcIiwgKHNlbGVjdGVkVXNlcnMgPz8gW10pLmxlbmd0aCwgXCIpXCJdIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTQgaXRlbXMtZW5kXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTFcIiwgY2hpbGRyZW46IF9qc3goSW5wdXQsIHsgbGFiZWw6IFwiU2VhcmNoIFVzZXJzXCIsIHZhbHVlOiBzZWFyY2hRdWVyeSwgb25DaGFuZ2U6IChlKSA9PiBzZXRTZWFyY2hRdWVyeShlLnRhcmdldC52YWx1ZSksIHBsYWNlaG9sZGVyOiBcIlNlYXJjaCBieSB1c2VybmFtZSwgZW1haWwsIG9yIG5hbWUuLi5cIiB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTQ4XCIsIGNoaWxkcmVuOiBfanN4KFNlbGVjdCwgeyBsYWJlbDogXCJSb2xlXCIsIHZhbHVlOiByb2xlRmlsdGVyLCBvbkNoYW5nZTogKHZhbHVlKSA9PiBzZXRSb2xlRmlsdGVyKHZhbHVlKSwgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiBcIlwiLCBsYWJlbDogXCJBbGwgUm9sZXNcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiBcIkFkbWluaXN0cmF0b3JcIiwgbGFiZWw6IFwiQWRtaW5pc3RyYXRvclwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6IFwiUG93ZXJVc2VyXCIsIGxhYmVsOiBcIlBvd2VyIFVzZXJcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiBcIlVzZXJcIiwgbGFiZWw6IFwiVXNlclwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6IFwiUmVhZE9ubHlcIiwgbGFiZWw6IFwiUmVhZCBPbmx5XCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIH0pIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInctNDhcIiwgY2hpbGRyZW46IF9qc3goU2VsZWN0LCB7IGxhYmVsOiBcIlN0YXR1c1wiLCB2YWx1ZTogc3RhdHVzRmlsdGVyLCBvbkNoYW5nZTogKHZhbHVlKSA9PiBzZXRTdGF0dXNGaWx0ZXIodmFsdWUpLCBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6IFwiXCIsIGxhYmVsOiBcIkFsbCBTdGF0dXNlc1wiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6IFwiQWN0aXZlXCIsIGxhYmVsOiBcIkFjdGl2ZVwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6IFwiRGlzYWJsZWRcIiwgbGFiZWw6IFwiRGlzYWJsZWRcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiBcIkxvY2tlZFwiLCBsYWJlbDogXCJMb2NrZWRcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gfSkgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIG9uQ2xpY2s6IGhhbmRsZUV4cG9ydCwgY2hpbGRyZW46IFwiRXhwb3J0XCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy00IGdhcC00XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctYmx1ZS01MCBkYXJrOmJnLWJsdWUtOTAwLzIwIHAtNCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItYmx1ZS0yMDAgZGFyazpib3JkZXItYmx1ZS04MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDBcIiwgY2hpbGRyZW46IFwiVG90YWwgVXNlcnNcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ibHVlLTkwMCBkYXJrOnRleHQtYmx1ZS0xMDBcIiwgY2hpbGRyZW46ICh1c2VycyA/PyBbXSkubGVuZ3RoIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctZ3JlZW4tNTAgZGFyazpiZy1ncmVlbi05MDAvMjAgcC00IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmVlbi0yMDAgZGFyazpib3JkZXItZ3JlZW4tODAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JlZW4tNjAwIGRhcms6dGV4dC1ncmVlbi00MDBcIiwgY2hpbGRyZW46IFwiQWN0aXZlXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JlZW4tOTAwIGRhcms6dGV4dC1ncmVlbi0xMDBcIiwgY2hpbGRyZW46ICh1c2VycyA/PyBbXSkuZmlsdGVyKHUgPT4gdS5zdGF0dXMgPT09ICdBY3RpdmUnKS5sZW5ndGggfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy15ZWxsb3ctNTAgZGFyazpiZy15ZWxsb3ctOTAwLzIwIHAtNCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXIteWVsbG93LTIwMCBkYXJrOmJvcmRlci15ZWxsb3ctODAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQteWVsbG93LTYwMCBkYXJrOnRleHQteWVsbG93LTQwMFwiLCBjaGlsZHJlbjogXCJBZG1pbmlzdHJhdG9yc1wiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LXllbGxvdy05MDAgZGFyazp0ZXh0LXllbGxvdy0xMDBcIiwgY2hpbGRyZW46ICh1c2VycyA/PyBbXSkuZmlsdGVyKHUgPT4gdS5yb2xlID09PSAnQWRtaW5pc3RyYXRvcicpLmxlbmd0aCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXJlZC01MCBkYXJrOmJnLXJlZC05MDAvMjAgcC00IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1yZWQtMjAwIGRhcms6Ym9yZGVyLXJlZC04MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwXCIsIGNoaWxkcmVuOiBcIkRpc2FibGVkXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtcmVkLTkwMCBkYXJrOnRleHQtcmVkLTEwMFwiLCBjaGlsZHJlbjogKHVzZXJzID8/IFtdKS5maWx0ZXIodSA9PiB1LnN0YXR1cyA9PT0gJ0Rpc2FibGVkJykubGVuZ3RoIH0pXSB9KV0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xXCIsIGNoaWxkcmVuOiBfanN4KFZpcnR1YWxpemVkRGF0YUdyaWQsIHsgZGF0YTogdXNlcnMsIGNvbHVtbnM6IGNvbHVtbnMsIGxvYWRpbmc6IGlzTG9hZGluZyB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IFVzZXJNYW5hZ2VtZW50VmlldztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==