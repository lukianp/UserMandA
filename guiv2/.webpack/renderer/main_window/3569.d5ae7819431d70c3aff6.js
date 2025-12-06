"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[3569],{

/***/ 23569:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  RoleManagementView: () => (/* binding */ RoleManagementView),
  "default": () => (/* binding */ admin_RoleManagementView)
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
// EXTERNAL MODULE: ./src/renderer/components/atoms/Badge.tsx
var Badge = __webpack_require__(61315);
// EXTERNAL MODULE: ./src/renderer/store/useNotificationStore.ts
var useNotificationStore = __webpack_require__(79455);
// EXTERNAL MODULE: ./src/renderer/services/exportService.ts
var exportService = __webpack_require__(63338);
;// ./src/renderer/hooks/useRoleManagementLogic.ts



const useRoleManagementLogic = () => {
    const [roles, setRoles] = (0,react.useState)([]);
    const [isLoading, setIsLoading] = (0,react.useState)(false);
    const [searchQuery, setSearchQuery] = (0,react.useState)('');
    const [selectedRoles, setSelectedRoles] = (0,react.useState)([]);
    const { addNotification } = (0,useNotificationStore/* useNotificationStore */.i)();
    (0,react.useEffect)(() => {
        loadRoles();
    }, []);
    const loadRoles = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const mockRoles = [
                {
                    id: '1',
                    name: 'Administrator',
                    description: 'Full system access with all permissions',
                    permissions: ['*'],
                    permissionCount: 50,
                    userCount: 3,
                    isBuiltIn: true,
                    createdDate: new Date('2024-01-01'),
                    modifiedDate: new Date('2024-01-01'),
                    modifiedBy: 'system',
                },
                {
                    id: '2',
                    name: 'Power User',
                    description: 'Advanced user with most permissions except system administration',
                    permissions: ['discovery.*', 'migration.*', 'reports.*'],
                    permissionCount: 35,
                    userCount: 12,
                    isBuiltIn: true,
                    createdDate: new Date('2024-01-01'),
                    modifiedDate: new Date('2024-01-01'),
                    modifiedBy: 'system',
                },
                {
                    id: '3',
                    name: 'User',
                    description: 'Standard user with basic read/write permissions',
                    permissions: ['discovery.read', 'reports.read', 'users.read'],
                    permissionCount: 15,
                    userCount: 45,
                    isBuiltIn: true,
                    createdDate: new Date('2024-01-01'),
                    modifiedDate: new Date('2024-01-01'),
                    modifiedBy: 'system',
                },
                {
                    id: '4',
                    name: 'Read Only',
                    description: 'View-only access to all modules',
                    permissions: ['*.read'],
                    permissionCount: 10,
                    userCount: 8,
                    isBuiltIn: true,
                    createdDate: new Date('2024-01-01'),
                    modifiedDate: new Date('2024-01-01'),
                    modifiedBy: 'system',
                },
                {
                    id: '5',
                    name: 'Migration Specialist',
                    description: 'Custom role for migration project managers',
                    permissions: ['migration.*', 'discovery.read', 'reports.migration'],
                    permissionCount: 18,
                    userCount: 5,
                    isBuiltIn: false,
                    createdDate: new Date('2024-06-15'),
                    modifiedDate: new Date('2025-09-20'),
                    modifiedBy: 'admin',
                },
            ];
            setRoles(mockRoles);
        }
        catch (error) {
            addNotification({ type: 'error', message: 'Failed to load roles', pinned: false, priority: 'normal' });
            console.error('Failed to load roles:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateRole = () => {
        addNotification({ type: 'info', message: 'Create role dialog would open here', pinned: false, priority: 'normal' });
    };
    const handleEditRole = (role) => {
        if (role.isBuiltIn) {
            addNotification({ type: 'warning', message: 'Built-in roles cannot be edited', pinned: false, priority: 'normal' });
            return;
        }
        addNotification({ type: 'info', message: `Edit role: ${role.name}`, pinned: false, priority: 'normal' });
    };
    const handleDeleteRoles = async () => {
        const deletableRoles = selectedRoles.filter(r => !r.isBuiltIn);
        if (deletableRoles.length === 0) {
            addNotification({ type: 'warning', message: 'Cannot delete built-in roles', pinned: false, priority: 'normal' });
            return;
        }
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setRoles(prev => prev.filter(r => !deletableRoles.find(d => d.id === r.id)));
            setSelectedRoles([]);
            addNotification({ type: 'success', message: `Deleted ${deletableRoles.length} role(s)`, pinned: false, priority: 'normal' });
        }
        catch (error) {
            addNotification({ type: 'error', message: 'Failed to delete roles', pinned: false, priority: 'normal' });
        }
    };
    const handleDuplicateRole = async (role) => {
        try {
            const newRole = {
                ...role,
                id: `${Date.now()}`,
                name: `${role.name} (Copy)`,
                userCount: 0,
                isBuiltIn: false,
                createdDate: new Date(),
                modifiedDate: new Date(),
                modifiedBy: 'current-user',
            };
            setRoles(prev => [...prev, newRole]);
            addNotification({ type: 'success', message: `Role duplicated: ${newRole.name}`, pinned: false, priority: 'normal' });
        }
        catch (error) {
            addNotification({ type: 'error', message: 'Failed to duplicate role', pinned: false, priority: 'normal' });
        }
    };
    const handleExport = async () => {
        try {
            const filteredRoles = getFilteredRoles();
            await exportService/* default */.A.exportToExcel(filteredRoles, 'Roles');
            addNotification({ type: 'success', message: 'Roles exported successfully', pinned: false, priority: 'normal' });
        }
        catch (error) {
            addNotification({ type: 'error', message: 'Failed to export roles', pinned: false, priority: 'normal' });
        }
    };
    const getFilteredRoles = () => {
        return roles.filter(role => searchQuery === '' ||
            (role.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (role.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()));
    };
    return {
        roles: getFilteredRoles(),
        isLoading,
        searchQuery,
        selectedRoles,
        setSearchQuery,
        handleCreateRole,
        handleEditRole,
        handleDeleteRoles,
        handleDuplicateRole,
        handleExport,
    };
};

;// ./src/renderer/views/admin/RoleManagementView.tsx








const RoleManagementView = () => {
    const { roles, isLoading, searchQuery, selectedRoles, setSearchQuery, handleCreateRole, handleEditRole, handleDeleteRoles, handleDuplicateRole, handleExport, } = useRoleManagementLogic();
    const columns = [
        {
            field: 'name',
            headerName: 'Role Name',
            sortable: true,
            filter: 'agTextColumnFilter',
            flex: 1,
            cellRenderer: (params) => ((0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* Shield */.ekZ, { className: "w-4 h-4 text-gray-500" }), (0,jsx_runtime.jsx)("span", { className: "font-medium", children: params.value })] })),
        },
        {
            field: 'description',
            headerName: 'Description',
            sortable: true,
            filter: 'agTextColumnFilter',
            flex: 2,
        },
        {
            field: 'userCount',
            headerName: 'Users',
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 120,
            cellRenderer: (params) => ((0,jsx_runtime.jsxs)(Badge/* Badge */.E, { variant: "info", children: [(0,jsx_runtime.jsx)(lucide_react/* Users */.zWC, { className: "w-3 h-3 mr-1" }), params.value] })),
        },
        {
            field: 'permissionCount',
            headerName: 'Permissions',
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 140,
        },
        {
            field: 'isBuiltIn',
            headerName: 'Type',
            sortable: true,
            filter: 'agSetColumnFilter',
            width: 120,
            cellRenderer: (params) => ((0,jsx_runtime.jsx)(Badge/* Badge */.E, { variant: params.value ? 'default' : 'info', children: params.value ? 'Built-in' : 'Custom' })),
        },
        {
            field: 'modifiedDate',
            headerName: 'Last Modified',
            sortable: true,
            filter: 'agDateColumnFilter',
            valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            filter: false,
            width: 200,
            cellRenderer: (params) => ((0,jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { size: "sm", variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Edit2 */.Pt, {}), onClick: () => handleEditRole(params.data), disabled: params.data.isBuiltIn, "aria-label": "Edit role", children: "Edit" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { size: "sm", variant: "secondary", onClick: () => handleDuplicateRole(params.data), "aria-label": "Duplicate role", children: "Duplicate" })] })),
        },
    ];
    return ((0,jsx_runtime.jsxs)("div", { className: "flex flex-col h-full p-6 space-y-6", "data-testid": "role-management-view", "data-cy": "role-management-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between items-center", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Role Management" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: "Define and manage security roles and their permissions" })] }), (0,jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react/* Plus */.FWt, {}), onClick: handleCreateRole, children: "Create Role" }), (0,jsx_runtime.jsxs)(Button/* Button */.$, { variant: "danger", icon: (0,jsx_runtime.jsx)(lucide_react/* Trash2 */.TBR, {}), onClick: handleDeleteRoles, disabled: (selectedRoles ?? []).length === 0 || (selectedRoles ?? []).some(r => r.isBuiltIn), children: ["Delete Selected (", (selectedRoles ?? []).length, ")"] })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex gap-4", children: [(0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(Input/* Input */.p, { label: "Search Roles", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search by name or description..." }) }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", onClick: handleExport, className: "self-end", children: "Export" })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-4 gap-4", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-blue-600 dark:text-blue-400", children: "Total Roles" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-blue-900 dark:text-blue-100", children: (roles ?? []).length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-purple-600 dark:text-purple-400", children: "Built-in Roles" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-purple-900 dark:text-purple-100", children: (roles ?? []).filter(r => r.isBuiltIn).length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-green-600 dark:text-green-400", children: "Custom Roles" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-green-900 dark:text-green-100", children: (roles ?? []).filter(r => !r.isBuiltIn).length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-yellow-600 dark:text-yellow-400", children: "Total Users Assigned" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-yellow-900 dark:text-yellow-100", children: roles.reduce((sum, r) => sum + r.userCount, 0) })] })] }), (0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid/* VirtualizedDataGrid */.Q, { data: roles, columns: columns, loading: isLoading }) })] }));
};
/* harmony default export */ const admin_RoleManagementView = (RoleManagementView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQyw4Q0FBbUIsSUFBSSxtREFBbUQsR0FBRyxJQUFJO0FBQzE4RjtBQUNBLCtEQUFlLGtCQUFrQixFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlUm9sZU1hbmFnZW1lbnRMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9hZG1pbi9Sb2xlTWFuYWdlbWVudFZpZXcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VOb3RpZmljYXRpb25TdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZU5vdGlmaWNhdGlvblN0b3JlJztcbmltcG9ydCBleHBvcnRTZXJ2aWNlIGZyb20gJy4uL3NlcnZpY2VzL2V4cG9ydFNlcnZpY2UnO1xuZXhwb3J0IGNvbnN0IHVzZVJvbGVNYW5hZ2VtZW50TG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgW3JvbGVzLCBzZXRSb2xlc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbc2VhcmNoUXVlcnksIHNldFNlYXJjaFF1ZXJ5XSA9IHVzZVN0YXRlKCcnKTtcbiAgICBjb25zdCBbc2VsZWN0ZWRSb2xlcywgc2V0U2VsZWN0ZWRSb2xlc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgeyBhZGROb3RpZmljYXRpb24gfSA9IHVzZU5vdGlmaWNhdGlvblN0b3JlKCk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZFJvbGVzKCk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IGxvYWRSb2xlcyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDgwMCkpO1xuICAgICAgICAgICAgY29uc3QgbW9ja1JvbGVzID0gW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICcxJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0FkbWluaXN0cmF0b3InLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgc3lzdGVtIGFjY2VzcyB3aXRoIGFsbCBwZXJtaXNzaW9ucycsXG4gICAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb25zOiBbJyonXSxcbiAgICAgICAgICAgICAgICAgICAgcGVybWlzc2lvbkNvdW50OiA1MCxcbiAgICAgICAgICAgICAgICAgICAgdXNlckNvdW50OiAzLFxuICAgICAgICAgICAgICAgICAgICBpc0J1aWx0SW46IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWREYXRlOiBuZXcgRGF0ZSgnMjAyNC0wMS0wMScpLFxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllZERhdGU6IG5ldyBEYXRlKCcyMDI0LTAxLTAxJyksXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkQnk6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpZDogJzInLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnUG93ZXIgVXNlcicsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQWR2YW5jZWQgdXNlciB3aXRoIG1vc3QgcGVybWlzc2lvbnMgZXhjZXB0IHN5c3RlbSBhZG1pbmlzdHJhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb25zOiBbJ2Rpc2NvdmVyeS4qJywgJ21pZ3JhdGlvbi4qJywgJ3JlcG9ydHMuKiddLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uQ291bnQ6IDM1LFxuICAgICAgICAgICAgICAgICAgICB1c2VyQ291bnQ6IDEyLFxuICAgICAgICAgICAgICAgICAgICBpc0J1aWx0SW46IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWREYXRlOiBuZXcgRGF0ZSgnMjAyNC0wMS0wMScpLFxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllZERhdGU6IG5ldyBEYXRlKCcyMDI0LTAxLTAxJyksXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkQnk6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpZDogJzMnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnVXNlcicsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU3RhbmRhcmQgdXNlciB3aXRoIGJhc2ljIHJlYWQvd3JpdGUgcGVybWlzc2lvbnMnLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uczogWydkaXNjb3ZlcnkucmVhZCcsICdyZXBvcnRzLnJlYWQnLCAndXNlcnMucmVhZCddLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uQ291bnQ6IDE1LFxuICAgICAgICAgICAgICAgICAgICB1c2VyQ291bnQ6IDQ1LFxuICAgICAgICAgICAgICAgICAgICBpc0J1aWx0SW46IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWREYXRlOiBuZXcgRGF0ZSgnMjAyNC0wMS0wMScpLFxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllZERhdGU6IG5ldyBEYXRlKCcyMDI0LTAxLTAxJyksXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkQnk6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpZDogJzQnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnUmVhZCBPbmx5JyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdWaWV3LW9ubHkgYWNjZXNzIHRvIGFsbCBtb2R1bGVzJyxcbiAgICAgICAgICAgICAgICAgICAgcGVybWlzc2lvbnM6IFsnKi5yZWFkJ10sXG4gICAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb25Db3VudDogMTAsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJDb3VudDogOCxcbiAgICAgICAgICAgICAgICAgICAgaXNCdWlsdEluOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkRGF0ZTogbmV3IERhdGUoJzIwMjQtMDEtMDEnKSxcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWREYXRlOiBuZXcgRGF0ZSgnMjAyNC0wMS0wMScpLFxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllZEJ5OiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICc1JyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ01pZ3JhdGlvbiBTcGVjaWFsaXN0JyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDdXN0b20gcm9sZSBmb3IgbWlncmF0aW9uIHByb2plY3QgbWFuYWdlcnMnLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uczogWydtaWdyYXRpb24uKicsICdkaXNjb3ZlcnkucmVhZCcsICdyZXBvcnRzLm1pZ3JhdGlvbiddLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uQ291bnQ6IDE4LFxuICAgICAgICAgICAgICAgICAgICB1c2VyQ291bnQ6IDUsXG4gICAgICAgICAgICAgICAgICAgIGlzQnVpbHRJbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWREYXRlOiBuZXcgRGF0ZSgnMjAyNC0wNi0xNScpLFxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllZERhdGU6IG5ldyBEYXRlKCcyMDI1LTA5LTIwJyksXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkQnk6ICdhZG1pbicsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBzZXRSb2xlcyhtb2NrUm9sZXMpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ2Vycm9yJywgbWVzc2FnZTogJ0ZhaWxlZCB0byBsb2FkIHJvbGVzJywgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgcm9sZXM6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlQ3JlYXRlUm9sZSA9ICgpID0+IHtcbiAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ2luZm8nLCBtZXNzYWdlOiAnQ3JlYXRlIHJvbGUgZGlhbG9nIHdvdWxkIG9wZW4gaGVyZScsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUVkaXRSb2xlID0gKHJvbGUpID0+IHtcbiAgICAgICAgaWYgKHJvbGUuaXNCdWlsdEluKSB7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnd2FybmluZycsIG1lc3NhZ2U6ICdCdWlsdC1pbiByb2xlcyBjYW5ub3QgYmUgZWRpdGVkJywgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdpbmZvJywgbWVzc2FnZTogYEVkaXQgcm9sZTogJHtyb2xlLm5hbWV9YCwgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlRGVsZXRlUm9sZXMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRlbGV0YWJsZVJvbGVzID0gc2VsZWN0ZWRSb2xlcy5maWx0ZXIociA9PiAhci5pc0J1aWx0SW4pO1xuICAgICAgICBpZiAoZGVsZXRhYmxlUm9sZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnd2FybmluZycsIG1lc3NhZ2U6ICdDYW5ub3QgZGVsZXRlIGJ1aWx0LWluIHJvbGVzJywgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTAwKSk7XG4gICAgICAgICAgICBzZXRSb2xlcyhwcmV2ID0+IHByZXYuZmlsdGVyKHIgPT4gIWRlbGV0YWJsZVJvbGVzLmZpbmQoZCA9PiBkLmlkID09PSByLmlkKSkpO1xuICAgICAgICAgICAgc2V0U2VsZWN0ZWRSb2xlcyhbXSk7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnc3VjY2VzcycsIG1lc3NhZ2U6IGBEZWxldGVkICR7ZGVsZXRhYmxlUm9sZXMubGVuZ3RofSByb2xlKHMpYCwgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ2Vycm9yJywgbWVzc2FnZTogJ0ZhaWxlZCB0byBkZWxldGUgcm9sZXMnLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUR1cGxpY2F0ZVJvbGUgPSBhc3luYyAocm9sZSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbmV3Um9sZSA9IHtcbiAgICAgICAgICAgICAgICAuLi5yb2xlLFxuICAgICAgICAgICAgICAgIGlkOiBgJHtEYXRlLm5vdygpfWAsXG4gICAgICAgICAgICAgICAgbmFtZTogYCR7cm9sZS5uYW1lfSAoQ29weSlgLFxuICAgICAgICAgICAgICAgIHVzZXJDb3VudDogMCxcbiAgICAgICAgICAgICAgICBpc0J1aWx0SW46IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNyZWF0ZWREYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgIG1vZGlmaWVkRGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICBtb2RpZmllZEJ5OiAnY3VycmVudC11c2VyJyxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZXRSb2xlcyhwcmV2ID0+IFsuLi5wcmV2LCBuZXdSb2xlXSk7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnc3VjY2VzcycsIG1lc3NhZ2U6IGBSb2xlIGR1cGxpY2F0ZWQ6ICR7bmV3Um9sZS5uYW1lfWAsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdlcnJvcicsIG1lc3NhZ2U6ICdGYWlsZWQgdG8gZHVwbGljYXRlIHJvbGUnLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUV4cG9ydCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkUm9sZXMgPSBnZXRGaWx0ZXJlZFJvbGVzKCk7XG4gICAgICAgICAgICBhd2FpdCBleHBvcnRTZXJ2aWNlLmV4cG9ydFRvRXhjZWwoZmlsdGVyZWRSb2xlcywgJ1JvbGVzJyk7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnc3VjY2VzcycsIG1lc3NhZ2U6ICdSb2xlcyBleHBvcnRlZCBzdWNjZXNzZnVsbHknLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnZXJyb3InLCBtZXNzYWdlOiAnRmFpbGVkIHRvIGV4cG9ydCByb2xlcycsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgZ2V0RmlsdGVyZWRSb2xlcyA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHJvbGVzLmZpbHRlcihyb2xlID0+IHNlYXJjaFF1ZXJ5ID09PSAnJyB8fFxuICAgICAgICAgICAgKHJvbGUubmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hRdWVyeS50b0xvd2VyQ2FzZSgpKSB8fFxuICAgICAgICAgICAgKHJvbGUuZGVzY3JpcHRpb24gPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoUXVlcnkudG9Mb3dlckNhc2UoKSkpO1xuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcm9sZXM6IGdldEZpbHRlcmVkUm9sZXMoKSxcbiAgICAgICAgaXNMb2FkaW5nLFxuICAgICAgICBzZWFyY2hRdWVyeSxcbiAgICAgICAgc2VsZWN0ZWRSb2xlcyxcbiAgICAgICAgc2V0U2VhcmNoUXVlcnksXG4gICAgICAgIGhhbmRsZUNyZWF0ZVJvbGUsXG4gICAgICAgIGhhbmRsZUVkaXRSb2xlLFxuICAgICAgICBoYW5kbGVEZWxldGVSb2xlcyxcbiAgICAgICAgaGFuZGxlRHVwbGljYXRlUm9sZSxcbiAgICAgICAgaGFuZGxlRXhwb3J0LFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBTaGllbGQsIFBsdXMsIFRyYXNoMiwgRWRpdDIsIFVzZXJzIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IFZpcnR1YWxpemVkRGF0YUdyaWQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9JbnB1dCc7XG5pbXBvcnQgeyBCYWRnZSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQmFkZ2UnO1xuaW1wb3J0IHsgdXNlUm9sZU1hbmFnZW1lbnRMb2dpYyB9IGZyb20gJy4uLy4uL2hvb2tzL3VzZVJvbGVNYW5hZ2VtZW50TG9naWMnO1xuZXhwb3J0IGNvbnN0IFJvbGVNYW5hZ2VtZW50VmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IHJvbGVzLCBpc0xvYWRpbmcsIHNlYXJjaFF1ZXJ5LCBzZWxlY3RlZFJvbGVzLCBzZXRTZWFyY2hRdWVyeSwgaGFuZGxlQ3JlYXRlUm9sZSwgaGFuZGxlRWRpdFJvbGUsIGhhbmRsZURlbGV0ZVJvbGVzLCBoYW5kbGVEdXBsaWNhdGVSb2xlLCBoYW5kbGVFeHBvcnQsIH0gPSB1c2VSb2xlTWFuYWdlbWVudExvZ2ljKCk7XG4gICAgY29uc3QgY29sdW1ucyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICduYW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdSb2xlIE5hbWUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1RleHRDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgZmxleDogMSxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChTaGllbGQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1ncmF5LTUwMFwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogcGFyYW1zLnZhbHVlIH0pXSB9KSksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIGZsZXg6IDIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAndXNlckNvdW50JyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdVc2VycycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnTnVtYmVyQ29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMjAsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IChfanN4cyhCYWRnZSwgeyB2YXJpYW50OiBcImluZm9cIiwgY2hpbGRyZW46IFtfanN4KFVzZXJzLCB7IGNsYXNzTmFtZTogXCJ3LTMgaC0zIG1yLTFcIiB9KSwgcGFyYW1zLnZhbHVlXSB9KSksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAncGVybWlzc2lvbkNvdW50JyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdQZXJtaXNzaW9ucycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnTnVtYmVyQ29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnaXNCdWlsdEluJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUeXBlJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdTZXRDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4gKF9qc3goQmFkZ2UsIHsgdmFyaWFudDogcGFyYW1zLnZhbHVlID8gJ2RlZmF1bHQnIDogJ2luZm8nLCBjaGlsZHJlbjogcGFyYW1zLnZhbHVlID8gJ0J1aWx0LWluJyA6ICdDdXN0b20nIH0pKSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdtb2RpZmllZERhdGUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0xhc3QgTW9kaWZpZWQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ0RhdGVDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnYWN0aW9ucycsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQWN0aW9ucycsXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICBmaWx0ZXI6IGZhbHNlLFxuICAgICAgICAgICAgd2lkdGg6IDIwMCxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIGljb246IF9qc3goRWRpdDIsIHt9KSwgb25DbGljazogKCkgPT4gaGFuZGxlRWRpdFJvbGUocGFyYW1zLmRhdGEpLCBkaXNhYmxlZDogcGFyYW1zLmRhdGEuaXNCdWlsdEluLCBcImFyaWEtbGFiZWxcIjogXCJFZGl0IHJvbGVcIiwgY2hpbGRyZW46IFwiRWRpdFwiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIG9uQ2xpY2s6ICgpID0+IGhhbmRsZUR1cGxpY2F0ZVJvbGUocGFyYW1zLmRhdGEpLCBcImFyaWEtbGFiZWxcIjogXCJEdXBsaWNhdGUgcm9sZVwiLCBjaGlsZHJlbjogXCJEdXBsaWNhdGVcIiB9KV0gfSkpLFxuICAgICAgICB9LFxuICAgIF07XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGZsZXgtY29sIGgtZnVsbCBwLTYgc3BhY2UteS02XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJyb2xlLW1hbmFnZW1lbnQtdmlld1wiLCBcImRhdGEtY3lcIjogXCJyb2xlLW1hbmFnZW1lbnQtdmlld1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIlJvbGUgTWFuYWdlbWVudFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIG10LTFcIiwgY2hpbGRyZW46IFwiRGVmaW5lIGFuZCBtYW5hZ2Ugc2VjdXJpdHkgcm9sZXMgYW5kIHRoZWlyIHBlcm1pc3Npb25zXCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIGljb246IF9qc3goUGx1cywge30pLCBvbkNsaWNrOiBoYW5kbGVDcmVhdGVSb2xlLCBjaGlsZHJlbjogXCJDcmVhdGUgUm9sZVwiIH0pLCBfanN4cyhCdXR0b24sIHsgdmFyaWFudDogXCJkYW5nZXJcIiwgaWNvbjogX2pzeChUcmFzaDIsIHt9KSwgb25DbGljazogaGFuZGxlRGVsZXRlUm9sZXMsIGRpc2FibGVkOiAoc2VsZWN0ZWRSb2xlcyA/PyBbXSkubGVuZ3RoID09PSAwIHx8IChzZWxlY3RlZFJvbGVzID8/IFtdKS5zb21lKHIgPT4gci5pc0J1aWx0SW4pLCBjaGlsZHJlbjogW1wiRGVsZXRlIFNlbGVjdGVkIChcIiwgKHNlbGVjdGVkUm9sZXMgPz8gW10pLmxlbmd0aCwgXCIpXCJdIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMVwiLCBjaGlsZHJlbjogX2pzeChJbnB1dCwgeyBsYWJlbDogXCJTZWFyY2ggUm9sZXNcIiwgdmFsdWU6IHNlYXJjaFF1ZXJ5LCBvbkNoYW5nZTogKGUpID0+IHNldFNlYXJjaFF1ZXJ5KGUudGFyZ2V0LnZhbHVlKSwgcGxhY2Vob2xkZXI6IFwiU2VhcmNoIGJ5IG5hbWUgb3IgZGVzY3JpcHRpb24uLi5cIiB9KSB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgb25DbGljazogaGFuZGxlRXhwb3J0LCBjbGFzc05hbWU6IFwic2VsZi1lbmRcIiwgY2hpbGRyZW46IFwiRXhwb3J0XCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy00IGdhcC00XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctYmx1ZS01MCBkYXJrOmJnLWJsdWUtOTAwLzIwIHAtNCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItYmx1ZS0yMDAgZGFyazpib3JkZXItYmx1ZS04MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDBcIiwgY2hpbGRyZW46IFwiVG90YWwgUm9sZXNcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ibHVlLTkwMCBkYXJrOnRleHQtYmx1ZS0xMDBcIiwgY2hpbGRyZW46IChyb2xlcyA/PyBbXSkubGVuZ3RoIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctcHVycGxlLTUwIGRhcms6YmctcHVycGxlLTkwMC8yMCBwLTQgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXB1cnBsZS0yMDAgZGFyazpib3JkZXItcHVycGxlLTgwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LXB1cnBsZS02MDAgZGFyazp0ZXh0LXB1cnBsZS00MDBcIiwgY2hpbGRyZW46IFwiQnVpbHQtaW4gUm9sZXNcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1wdXJwbGUtOTAwIGRhcms6dGV4dC1wdXJwbGUtMTAwXCIsIGNoaWxkcmVuOiAocm9sZXMgPz8gW10pLmZpbHRlcihyID0+IHIuaXNCdWlsdEluKS5sZW5ndGggfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1ncmVlbi01MCBkYXJrOmJnLWdyZWVuLTkwMC8yMCBwLTQgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyZWVuLTIwMCBkYXJrOmJvcmRlci1ncmVlbi04MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmVlbi02MDAgZGFyazp0ZXh0LWdyZWVuLTQwMFwiLCBjaGlsZHJlbjogXCJDdXN0b20gUm9sZXNcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmVlbi05MDAgZGFyazp0ZXh0LWdyZWVuLTEwMFwiLCBjaGlsZHJlbjogKHJvbGVzID8/IFtdKS5maWx0ZXIociA9PiAhci5pc0J1aWx0SW4pLmxlbmd0aCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXllbGxvdy01MCBkYXJrOmJnLXllbGxvdy05MDAvMjAgcC00IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci15ZWxsb3ctMjAwIGRhcms6Ym9yZGVyLXllbGxvdy04MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC15ZWxsb3ctNjAwIGRhcms6dGV4dC15ZWxsb3ctNDAwXCIsIGNoaWxkcmVuOiBcIlRvdGFsIFVzZXJzIEFzc2lnbmVkXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQteWVsbG93LTkwMCBkYXJrOnRleHQteWVsbG93LTEwMFwiLCBjaGlsZHJlbjogcm9sZXMucmVkdWNlKChzdW0sIHIpID0+IHN1bSArIHIudXNlckNvdW50LCAwKSB9KV0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMVwiLCBjaGlsZHJlbjogX2pzeChWaXJ0dWFsaXplZERhdGFHcmlkLCB7IGRhdGE6IHJvbGVzLCBjb2x1bW5zOiBjb2x1bW5zLCBsb2FkaW5nOiBpc0xvYWRpbmcgfSkgfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBSb2xlTWFuYWdlbWVudFZpZXc7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=