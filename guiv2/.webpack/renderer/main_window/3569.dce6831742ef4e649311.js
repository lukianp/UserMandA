"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[3569],{

/***/ 23569:
/*!*********************************************************************!*\
  !*** ./src/renderer/views/admin/RoleManagementView.tsx + 1 modules ***!
  \*********************************************************************/
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
    const { addNotification } = (0,useNotificationStore.useNotificationStore)();
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
            await exportService["default"].exportToExcel(filteredRoles, 'Roles');
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
            cellRenderer: (params) => ((0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.Shield, { className: "w-4 h-4 text-gray-500" }), (0,jsx_runtime.jsx)("span", { className: "font-medium", children: params.value })] })),
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
            cellRenderer: (params) => ((0,jsx_runtime.jsxs)(Badge.Badge, { variant: "info", children: [(0,jsx_runtime.jsx)(lucide_react.Users, { className: "w-3 h-3 mr-1" }), params.value] })),
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
            cellRenderer: (params) => ((0,jsx_runtime.jsx)(Badge.Badge, { variant: params.value ? 'default' : 'info', children: params.value ? 'Built-in' : 'Custom' })),
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
            cellRenderer: (params) => ((0,jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [(0,jsx_runtime.jsx)(Button.Button, { size: "sm", variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react.Edit2, {}), onClick: () => handleEditRole(params.data), disabled: params.data.isBuiltIn, "aria-label": "Edit role", children: "Edit" }), (0,jsx_runtime.jsx)(Button.Button, { size: "sm", variant: "secondary", onClick: () => handleDuplicateRole(params.data), "aria-label": "Duplicate role", children: "Duplicate" })] })),
        },
    ];
    return ((0,jsx_runtime.jsxs)("div", { className: "flex flex-col h-full p-6 space-y-6", "data-testid": "role-management-view", "data-cy": "role-management-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between items-center", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Role Management" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: "Define and manage security roles and their permissions" })] }), (0,jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [(0,jsx_runtime.jsx)(Button.Button, { variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react.Plus, {}), onClick: handleCreateRole, children: "Create Role" }), (0,jsx_runtime.jsxs)(Button.Button, { variant: "danger", icon: (0,jsx_runtime.jsx)(lucide_react.Trash2, {}), onClick: handleDeleteRoles, disabled: (selectedRoles ?? []).length === 0 || (selectedRoles ?? []).some(r => r.isBuiltIn), children: ["Delete Selected (", (selectedRoles ?? []).length, ")"] })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex gap-4", children: [(0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(Input.Input, { label: "Search Roles", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search by name or description..." }) }), (0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", onClick: handleExport, className: "self-end", children: "Export" })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-4 gap-4", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-blue-600 dark:text-blue-400", children: "Total Roles" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-blue-900 dark:text-blue-100", children: (roles ?? []).length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-purple-600 dark:text-purple-400", children: "Built-in Roles" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-purple-900 dark:text-purple-100", children: (roles ?? []).filter(r => r.isBuiltIn).length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-green-600 dark:text-green-400", children: "Custom Roles" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-green-900 dark:text-green-100", children: (roles ?? []).filter(r => !r.isBuiltIn).length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-yellow-600 dark:text-yellow-400", children: "Total Users Assigned" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-yellow-900 dark:text-yellow-100", children: roles.reduce((sum, r) => sum + r.userCount, 0) })] })] }), (0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid.VirtualizedDataGrid, { data: roles, columns: columns, loading: isLoading }) })] }));
};
/* harmony default export */ const admin_RoleManagementView = (RoleManagementView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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dUNBQW1CLElBQUksbURBQW1ELEdBQUcsSUFBSTtBQUMxOEY7QUFDQSwrREFBZSxrQkFBa0IsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZVJvbGVNYW5hZ2VtZW50TG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdmlld3MvYWRtaW4vUm9sZU1hbmFnZW1lbnRWaWV3LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlTm90aWZpY2F0aW9uU3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VOb3RpZmljYXRpb25TdG9yZSc7XG5pbXBvcnQgZXhwb3J0U2VydmljZSBmcm9tICcuLi9zZXJ2aWNlcy9leHBvcnRTZXJ2aWNlJztcbmV4cG9ydCBjb25zdCB1c2VSb2xlTWFuYWdlbWVudExvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IFtyb2xlcywgc2V0Um9sZXNdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3NlYXJjaFF1ZXJ5LCBzZXRTZWFyY2hRdWVyeV0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW3NlbGVjdGVkUm9sZXMsIHNldFNlbGVjdGVkUm9sZXNdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IHsgYWRkTm90aWZpY2F0aW9uIH0gPSB1c2VOb3RpZmljYXRpb25TdG9yZSgpO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRSb2xlcygpO1xuICAgIH0sIFtdKTtcbiAgICBjb25zdCBsb2FkUm9sZXMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCA4MDApKTtcbiAgICAgICAgICAgIGNvbnN0IG1vY2tSb2xlcyA9IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnMScsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBZG1pbmlzdHJhdG9yJyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdGdWxsIHN5c3RlbSBhY2Nlc3Mgd2l0aCBhbGwgcGVybWlzc2lvbnMnLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uczogWycqJ10sXG4gICAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb25Db3VudDogNTAsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJDb3VudDogMyxcbiAgICAgICAgICAgICAgICAgICAgaXNCdWlsdEluOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkRGF0ZTogbmV3IERhdGUoJzIwMjQtMDEtMDEnKSxcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWREYXRlOiBuZXcgRGF0ZSgnMjAyNC0wMS0wMScpLFxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllZEJ5OiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICcyJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1Bvd2VyIFVzZXInLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0FkdmFuY2VkIHVzZXIgd2l0aCBtb3N0IHBlcm1pc3Npb25zIGV4Y2VwdCBzeXN0ZW0gYWRtaW5pc3RyYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uczogWydkaXNjb3ZlcnkuKicsICdtaWdyYXRpb24uKicsICdyZXBvcnRzLionXSxcbiAgICAgICAgICAgICAgICAgICAgcGVybWlzc2lvbkNvdW50OiAzNSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckNvdW50OiAxMixcbiAgICAgICAgICAgICAgICAgICAgaXNCdWlsdEluOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkRGF0ZTogbmV3IERhdGUoJzIwMjQtMDEtMDEnKSxcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWREYXRlOiBuZXcgRGF0ZSgnMjAyNC0wMS0wMScpLFxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllZEJ5OiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICczJyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1VzZXInLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1N0YW5kYXJkIHVzZXIgd2l0aCBiYXNpYyByZWFkL3dyaXRlIHBlcm1pc3Npb25zJyxcbiAgICAgICAgICAgICAgICAgICAgcGVybWlzc2lvbnM6IFsnZGlzY292ZXJ5LnJlYWQnLCAncmVwb3J0cy5yZWFkJywgJ3VzZXJzLnJlYWQnXSxcbiAgICAgICAgICAgICAgICAgICAgcGVybWlzc2lvbkNvdW50OiAxNSxcbiAgICAgICAgICAgICAgICAgICAgdXNlckNvdW50OiA0NSxcbiAgICAgICAgICAgICAgICAgICAgaXNCdWlsdEluOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkRGF0ZTogbmV3IERhdGUoJzIwMjQtMDEtMDEnKSxcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWREYXRlOiBuZXcgRGF0ZSgnMjAyNC0wMS0wMScpLFxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllZEJ5OiAnc3lzdGVtJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICc0JyxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1JlYWQgT25seScsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVmlldy1vbmx5IGFjY2VzcyB0byBhbGwgbW9kdWxlcycsXG4gICAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb25zOiBbJyoucmVhZCddLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uQ291bnQ6IDEwLFxuICAgICAgICAgICAgICAgICAgICB1c2VyQ291bnQ6IDgsXG4gICAgICAgICAgICAgICAgICAgIGlzQnVpbHRJbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZERhdGU6IG5ldyBEYXRlKCcyMDI0LTAxLTAxJyksXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkRGF0ZTogbmV3IERhdGUoJzIwMjQtMDEtMDEnKSxcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRCeTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnNScsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdNaWdyYXRpb24gU3BlY2lhbGlzdCcsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ3VzdG9tIHJvbGUgZm9yIG1pZ3JhdGlvbiBwcm9qZWN0IG1hbmFnZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgcGVybWlzc2lvbnM6IFsnbWlncmF0aW9uLionLCAnZGlzY292ZXJ5LnJlYWQnLCAncmVwb3J0cy5taWdyYXRpb24nXSxcbiAgICAgICAgICAgICAgICAgICAgcGVybWlzc2lvbkNvdW50OiAxOCxcbiAgICAgICAgICAgICAgICAgICAgdXNlckNvdW50OiA1LFxuICAgICAgICAgICAgICAgICAgICBpc0J1aWx0SW46IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkRGF0ZTogbmV3IERhdGUoJzIwMjQtMDYtMTUnKSxcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWREYXRlOiBuZXcgRGF0ZSgnMjAyNS0wOS0yMCcpLFxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllZEJ5OiAnYWRtaW4nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgc2V0Um9sZXMobW9ja1JvbGVzKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdlcnJvcicsIG1lc3NhZ2U6ICdGYWlsZWQgdG8gbG9hZCByb2xlcycsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHJvbGVzOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUNyZWF0ZVJvbGUgPSAoKSA9PiB7XG4gICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdpbmZvJywgbWVzc2FnZTogJ0NyZWF0ZSByb2xlIGRpYWxvZyB3b3VsZCBvcGVuIGhlcmUnLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVFZGl0Um9sZSA9IChyb2xlKSA9PiB7XG4gICAgICAgIGlmIChyb2xlLmlzQnVpbHRJbikge1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ3dhcm5pbmcnLCBtZXNzYWdlOiAnQnVpbHQtaW4gcm9sZXMgY2Fubm90IGJlIGVkaXRlZCcsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnaW5mbycsIG1lc3NhZ2U6IGBFZGl0IHJvbGU6ICR7cm9sZS5uYW1lfWAsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZURlbGV0ZVJvbGVzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBkZWxldGFibGVSb2xlcyA9IHNlbGVjdGVkUm9sZXMuZmlsdGVyKHIgPT4gIXIuaXNCdWlsdEluKTtcbiAgICAgICAgaWYgKGRlbGV0YWJsZVJvbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ3dhcm5pbmcnLCBtZXNzYWdlOiAnQ2Fubm90IGRlbGV0ZSBidWlsdC1pbiByb2xlcycsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDUwMCkpO1xuICAgICAgICAgICAgc2V0Um9sZXMocHJldiA9PiBwcmV2LmZpbHRlcihyID0+ICFkZWxldGFibGVSb2xlcy5maW5kKGQgPT4gZC5pZCA9PT0gci5pZCkpKTtcbiAgICAgICAgICAgIHNldFNlbGVjdGVkUm9sZXMoW10pO1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ3N1Y2Nlc3MnLCBtZXNzYWdlOiBgRGVsZXRlZCAke2RlbGV0YWJsZVJvbGVzLmxlbmd0aH0gcm9sZShzKWAsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdlcnJvcicsIG1lc3NhZ2U6ICdGYWlsZWQgdG8gZGVsZXRlIHJvbGVzJywgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVEdXBsaWNhdGVSb2xlID0gYXN5bmMgKHJvbGUpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1JvbGUgPSB7XG4gICAgICAgICAgICAgICAgLi4ucm9sZSxcbiAgICAgICAgICAgICAgICBpZDogYCR7RGF0ZS5ub3coKX1gLFxuICAgICAgICAgICAgICAgIG5hbWU6IGAke3JvbGUubmFtZX0gKENvcHkpYCxcbiAgICAgICAgICAgICAgICB1c2VyQ291bnQ6IDAsXG4gICAgICAgICAgICAgICAgaXNCdWlsdEluOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjcmVhdGVkRGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICBtb2RpZmllZERhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgbW9kaWZpZWRCeTogJ2N1cnJlbnQtdXNlcicsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2V0Um9sZXMocHJldiA9PiBbLi4ucHJldiwgbmV3Um9sZV0pO1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ3N1Y2Nlc3MnLCBtZXNzYWdlOiBgUm9sZSBkdXBsaWNhdGVkOiAke25ld1JvbGUubmFtZX1gLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnZXJyb3InLCBtZXNzYWdlOiAnRmFpbGVkIHRvIGR1cGxpY2F0ZSByb2xlJywgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVFeHBvcnQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZFJvbGVzID0gZ2V0RmlsdGVyZWRSb2xlcygpO1xuICAgICAgICAgICAgYXdhaXQgZXhwb3J0U2VydmljZS5leHBvcnRUb0V4Y2VsKGZpbHRlcmVkUm9sZXMsICdSb2xlcycpO1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ3N1Y2Nlc3MnLCBtZXNzYWdlOiAnUm9sZXMgZXhwb3J0ZWQgc3VjY2Vzc2Z1bGx5JywgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ2Vycm9yJywgbWVzc2FnZTogJ0ZhaWxlZCB0byBleHBvcnQgcm9sZXMnLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGdldEZpbHRlcmVkUm9sZXMgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiByb2xlcy5maWx0ZXIocm9sZSA9PiBzZWFyY2hRdWVyeSA9PT0gJycgfHxcbiAgICAgICAgICAgIChyb2xlLm5hbWUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoUXVlcnkudG9Mb3dlckNhc2UoKSkgfHxcbiAgICAgICAgICAgIChyb2xlLmRlc2NyaXB0aW9uID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFF1ZXJ5LnRvTG93ZXJDYXNlKCkpKTtcbiAgICB9O1xuICAgIHJldHVybiB7XG4gICAgICAgIHJvbGVzOiBnZXRGaWx0ZXJlZFJvbGVzKCksXG4gICAgICAgIGlzTG9hZGluZyxcbiAgICAgICAgc2VhcmNoUXVlcnksXG4gICAgICAgIHNlbGVjdGVkUm9sZXMsXG4gICAgICAgIHNldFNlYXJjaFF1ZXJ5LFxuICAgICAgICBoYW5kbGVDcmVhdGVSb2xlLFxuICAgICAgICBoYW5kbGVFZGl0Um9sZSxcbiAgICAgICAgaGFuZGxlRGVsZXRlUm9sZXMsXG4gICAgICAgIGhhbmRsZUR1cGxpY2F0ZVJvbGUsXG4gICAgICAgIGhhbmRsZUV4cG9ydCxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgU2hpZWxkLCBQbHVzLCBUcmFzaDIsIEVkaXQyLCBVc2VycyB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBWaXJ0dWFsaXplZERhdGFHcmlkIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBJbnB1dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvSW5wdXQnO1xuaW1wb3J0IHsgQmFkZ2UgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0JhZGdlJztcbmltcG9ydCB7IHVzZVJvbGVNYW5hZ2VtZW50TG9naWMgfSBmcm9tICcuLi8uLi9ob29rcy91c2VSb2xlTWFuYWdlbWVudExvZ2ljJztcbmV4cG9ydCBjb25zdCBSb2xlTWFuYWdlbWVudFZpZXcgPSAoKSA9PiB7XG4gICAgY29uc3QgeyByb2xlcywgaXNMb2FkaW5nLCBzZWFyY2hRdWVyeSwgc2VsZWN0ZWRSb2xlcywgc2V0U2VhcmNoUXVlcnksIGhhbmRsZUNyZWF0ZVJvbGUsIGhhbmRsZUVkaXRSb2xlLCBoYW5kbGVEZWxldGVSb2xlcywgaGFuZGxlRHVwbGljYXRlUm9sZSwgaGFuZGxlRXhwb3J0LCB9ID0gdXNlUm9sZU1hbmFnZW1lbnRMb2dpYygpO1xuICAgIGNvbnN0IGNvbHVtbnMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnbmFtZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUm9sZSBOYW1lJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goU2hpZWxkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtZ3JheS01MDBcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IHBhcmFtcy52YWx1ZSB9KV0gfSkpLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEZXNjcmlwdGlvbicsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICBmbGV4OiAyLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3VzZXJDb3VudCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnVXNlcnMnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ051bWJlckNvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICB3aWR0aDogMTIwLFxuICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiAocGFyYW1zKSA9PiAoX2pzeHMoQmFkZ2UsIHsgdmFyaWFudDogXCJpbmZvXCIsIGNoaWxkcmVuOiBbX2pzeChVc2VycywgeyBjbGFzc05hbWU6IFwidy0zIGgtMyBtci0xXCIgfSksIHBhcmFtcy52YWx1ZV0gfSkpLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3Blcm1pc3Npb25Db3VudCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUGVybWlzc2lvbnMnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ051bWJlckNvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICB3aWR0aDogMTQwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2lzQnVpbHRJbicsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnVHlwZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnU2V0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMjAsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IChfanN4KEJhZGdlLCB7IHZhcmlhbnQ6IHBhcmFtcy52YWx1ZSA/ICdkZWZhdWx0JyA6ICdpbmZvJywgY2hpbGRyZW46IHBhcmFtcy52YWx1ZSA/ICdCdWlsdC1pbicgOiAnQ3VzdG9tJyB9KSksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnbW9kaWZpZWREYXRlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdMYXN0IE1vZGlmaWVkJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdEYXRlQ29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBuZXcgRGF0ZShwYXJhbXMudmFsdWUpLnRvTG9jYWxlRGF0ZVN0cmluZygpLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2FjdGlvbnMnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0FjdGlvbnMnLFxuICAgICAgICAgICAgc29ydGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZmlsdGVyOiBmYWxzZSxcbiAgICAgICAgICAgIHdpZHRoOiAyMDAsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBpY29uOiBfanN4KEVkaXQyLCB7fSksIG9uQ2xpY2s6ICgpID0+IGhhbmRsZUVkaXRSb2xlKHBhcmFtcy5kYXRhKSwgZGlzYWJsZWQ6IHBhcmFtcy5kYXRhLmlzQnVpbHRJbiwgXCJhcmlhLWxhYmVsXCI6IFwiRWRpdCByb2xlXCIsIGNoaWxkcmVuOiBcIkVkaXRcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiAoKSA9PiBoYW5kbGVEdXBsaWNhdGVSb2xlKHBhcmFtcy5kYXRhKSwgXCJhcmlhLWxhYmVsXCI6IFwiRHVwbGljYXRlIHJvbGVcIiwgY2hpbGRyZW46IFwiRHVwbGljYXRlXCIgfSldIH0pKSxcbiAgICAgICAgfSxcbiAgICBdO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBmbGV4LWNvbCBoLWZ1bGwgcC02IHNwYWNlLXktNlwiLCBcImRhdGEtdGVzdGlkXCI6IFwicm9sZS1tYW5hZ2VtZW50LXZpZXdcIiwgXCJkYXRhLWN5XCI6IFwicm9sZS1tYW5hZ2VtZW50LXZpZXdcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJSb2xlIE1hbmFnZW1lbnRcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMCBtdC0xXCIsIGNoaWxkcmVuOiBcIkRlZmluZSBhbmQgbWFuYWdlIHNlY3VyaXR5IHJvbGVzIGFuZCB0aGVpciBwZXJtaXNzaW9uc1wiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBpY29uOiBfanN4KFBsdXMsIHt9KSwgb25DbGljazogaGFuZGxlQ3JlYXRlUm9sZSwgY2hpbGRyZW46IFwiQ3JlYXRlIFJvbGVcIiB9KSwgX2pzeHMoQnV0dG9uLCB7IHZhcmlhbnQ6IFwiZGFuZ2VyXCIsIGljb246IF9qc3goVHJhc2gyLCB7fSksIG9uQ2xpY2s6IGhhbmRsZURlbGV0ZVJvbGVzLCBkaXNhYmxlZDogKHNlbGVjdGVkUm9sZXMgPz8gW10pLmxlbmd0aCA9PT0gMCB8fCAoc2VsZWN0ZWRSb2xlcyA/PyBbXSkuc29tZShyID0+IHIuaXNCdWlsdEluKSwgY2hpbGRyZW46IFtcIkRlbGV0ZSBTZWxlY3RlZCAoXCIsIChzZWxlY3RlZFJvbGVzID8/IFtdKS5sZW5ndGgsIFwiKVwiXSB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGdhcC00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTFcIiwgY2hpbGRyZW46IF9qc3goSW5wdXQsIHsgbGFiZWw6IFwiU2VhcmNoIFJvbGVzXCIsIHZhbHVlOiBzZWFyY2hRdWVyeSwgb25DaGFuZ2U6IChlKSA9PiBzZXRTZWFyY2hRdWVyeShlLnRhcmdldC52YWx1ZSksIHBsYWNlaG9sZGVyOiBcIlNlYXJjaCBieSBuYW1lIG9yIGRlc2NyaXB0aW9uLi4uXCIgfSkgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIG9uQ2xpY2s6IGhhbmRsZUV4cG9ydCwgY2xhc3NOYW1lOiBcInNlbGYtZW5kXCIsIGNoaWxkcmVuOiBcIkV4cG9ydFwiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtNCBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLWJsdWUtNTAgZGFyazpiZy1ibHVlLTkwMC8yMCBwLTQgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWJsdWUtMjAwIGRhcms6Ym9yZGVyLWJsdWUtODAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtYmx1ZS02MDAgZGFyazp0ZXh0LWJsdWUtNDAwXCIsIGNoaWxkcmVuOiBcIlRvdGFsIFJvbGVzXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtYmx1ZS05MDAgZGFyazp0ZXh0LWJsdWUtMTAwXCIsIGNoaWxkcmVuOiAocm9sZXMgPz8gW10pLmxlbmd0aCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXB1cnBsZS01MCBkYXJrOmJnLXB1cnBsZS05MDAvMjAgcC00IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1wdXJwbGUtMjAwIGRhcms6Ym9yZGVyLXB1cnBsZS04MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1wdXJwbGUtNjAwIGRhcms6dGV4dC1wdXJwbGUtNDAwXCIsIGNoaWxkcmVuOiBcIkJ1aWx0LWluIFJvbGVzXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtcHVycGxlLTkwMCBkYXJrOnRleHQtcHVycGxlLTEwMFwiLCBjaGlsZHJlbjogKHJvbGVzID8/IFtdKS5maWx0ZXIociA9PiByLmlzQnVpbHRJbikubGVuZ3RoIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctZ3JlZW4tNTAgZGFyazpiZy1ncmVlbi05MDAvMjAgcC00IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmVlbi0yMDAgZGFyazpib3JkZXItZ3JlZW4tODAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JlZW4tNjAwIGRhcms6dGV4dC1ncmVlbi00MDBcIiwgY2hpbGRyZW46IFwiQ3VzdG9tIFJvbGVzXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JlZW4tOTAwIGRhcms6dGV4dC1ncmVlbi0xMDBcIiwgY2hpbGRyZW46IChyb2xlcyA/PyBbXSkuZmlsdGVyKHIgPT4gIXIuaXNCdWlsdEluKS5sZW5ndGggfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy15ZWxsb3ctNTAgZGFyazpiZy15ZWxsb3ctOTAwLzIwIHAtNCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXIteWVsbG93LTIwMCBkYXJrOmJvcmRlci15ZWxsb3ctODAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQteWVsbG93LTYwMCBkYXJrOnRleHQteWVsbG93LTQwMFwiLCBjaGlsZHJlbjogXCJUb3RhbCBVc2VycyBBc3NpZ25lZFwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LXllbGxvdy05MDAgZGFyazp0ZXh0LXllbGxvdy0xMDBcIiwgY2hpbGRyZW46IHJvbGVzLnJlZHVjZSgoc3VtLCByKSA9PiBzdW0gKyByLnVzZXJDb3VudCwgMCkgfSldIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTFcIiwgY2hpbGRyZW46IF9qc3goVmlydHVhbGl6ZWREYXRhR3JpZCwgeyBkYXRhOiByb2xlcywgY29sdW1uczogY29sdW1ucywgbG9hZGluZzogaXNMb2FkaW5nIH0pIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgUm9sZU1hbmFnZW1lbnRWaWV3O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9