"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2979],{

/***/ 92979:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  AuditLogView: () => (/* binding */ AuditLogView),
  "default": () => (/* binding */ admin_AuditLogView)
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
;// ./src/renderer/hooks/useAuditLogLogic.ts



const useAuditLogLogic = () => {
    const [auditLogs, setAuditLogs] = (0,react.useState)([]);
    const [isLoading, setIsLoading] = (0,react.useState)(false);
    const [searchQuery, setSearchQuery] = (0,react.useState)('');
    const [actionFilter, setActionFilter] = (0,react.useState)('');
    const [severityFilter, setSeverityFilter] = (0,react.useState)('');
    const [userFilter, setUserFilter] = (0,react.useState)('');
    const [dateRange, setDateRange] = (0,react.useState)('week');
    const { addNotification } = (0,useNotificationStore/* useNotificationStore */.i)();
    (0,react.useEffect)(() => {
        loadAuditLogs();
    }, [dateRange]);
    const loadAuditLogs = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Generate mock audit logs
            const mockLogs = [];
            const actions = ['Login', 'Logout', 'Create', 'Update', 'Delete', 'Export', 'Import', 'Execute'];
            const categories = ['Authentication', 'User Management', 'Discovery', 'Migration', 'Reports', 'System'];
            const severities = ['Critical', 'Warning', 'Info', 'Success'];
            const users = ['admin', 'jsmith', 'mjones', 'rdavis'];
            for (let i = 0; i < 500; i++) {
                const timestamp = new Date();
                timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 168)); // Last week
                const action = actions[Math.floor(Math.random() * actions.length)];
                const success = Math.random() > 0.1; // 90% success rate
                mockLogs.push({
                    id: `log-${i}`,
                    timestamp,
                    user: users[Math.floor(Math.random() * users.length)],
                    action,
                    category: categories[Math.floor(Math.random() * categories.length)],
                    severity: success ? 'Success' : severities[Math.floor(Math.random() * 3)],
                    details: `${action} operation ${success ? 'completed successfully' : 'failed'}`,
                    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                    success,
                    duration: Math.floor(Math.random() * 5000),
                    resourceType: Math.random() > 0.5 ? 'User' : 'Project',
                    resourceId: `res-${Math.floor(Math.random() * 1000)}`,
                });
            }
            // Sort by timestamp descending
            mockLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            setAuditLogs(mockLogs);
        }
        catch (error) {
            addNotification({ type: 'error', message: 'Failed to load audit logs', pinned: false, priority: 'normal' });
            console.error('Failed to load audit logs:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleExport = async () => {
        try {
            const filteredLogs = getFilteredLogs();
            await exportService/* default */.A.exportToExcel(filteredLogs, 'AuditLogs');
            addNotification({ type: 'success', message: `Exported ${filteredLogs.length} audit log entries`, pinned: false, priority: 'normal' });
        }
        catch (error) {
            addNotification({ type: 'error', message: 'Failed to export audit logs', pinned: false, priority: 'normal' });
        }
    };
    const handleRefresh = () => {
        loadAuditLogs();
        addNotification({ type: 'info', message: 'Audit logs refreshed', pinned: false, priority: 'low' });
    };
    const getFilteredLogs = () => {
        return auditLogs.filter(log => {
            const matchesSearch = searchQuery === '' ||
                (log.user ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (log.action ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (log.details ?? '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesAction = actionFilter === '' || log.action === actionFilter;
            const matchesSeverity = severityFilter === '' || log.severity === severityFilter;
            const matchesUser = userFilter === '' || log.user === userFilter;
            // Date range filtering
            const now = new Date();
            let matchesDate = true;
            if (dateRange === 'today') {
                matchesDate = log.timestamp.toDateString() === now.toDateString();
            }
            else if (dateRange === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                matchesDate = log.timestamp >= weekAgo;
            }
            else if (dateRange === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                matchesDate = log.timestamp >= monthAgo;
            }
            else if (dateRange === 'quarter') {
                const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                matchesDate = log.timestamp >= quarterAgo;
            }
            return matchesSearch && matchesAction && matchesSeverity && matchesUser && matchesDate;
        });
    };
    return {
        auditLogs: getFilteredLogs(),
        isLoading,
        searchQuery,
        actionFilter,
        severityFilter,
        userFilter,
        dateRange,
        setSearchQuery,
        setActionFilter,
        setSeverityFilter,
        setUserFilter,
        setDateRange,
        handleExport,
        handleRefresh,
    };
};

;// ./src/renderer/views/admin/AuditLogView.tsx









const AuditLogView = () => {
    const { auditLogs, isLoading, searchQuery, actionFilter, severityFilter, userFilter, dateRange, setSearchQuery, setActionFilter, setSeverityFilter, setUserFilter, setDateRange, handleExport, handleRefresh, } = useAuditLogLogic();
    const columns = [
        {
            field: 'timestamp',
            headerName: 'Timestamp',
            sortable: true,
            filter: 'agDateColumnFilter',
            width: 180,
            valueFormatter: (params) => new Date(params.value).toLocaleString(),
            sort: 'desc',
        },
        {
            field: 'user',
            headerName: 'User',
            sortable: true,
            filter: 'agTextColumnFilter',
            width: 150,
            cellRenderer: (params) => ((0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* User */.KJW, { className: "w-4 h-4 text-gray-500" }), (0,jsx_runtime.jsx)("span", { children: params.value })] })),
        },
        {
            field: 'action',
            headerName: 'Action',
            sortable: true,
            filter: 'agSetColumnFilter',
            width: 200,
            cellRenderer: (params) => ((0,jsx_runtime.jsx)("span", { className: "font-medium", children: params.value })),
        },
        {
            field: 'category',
            headerName: 'Category',
            sortable: true,
            filter: 'agSetColumnFilter',
            width: 140,
            cellRenderer: (params) => ((0,jsx_runtime.jsx)(Badge/* Badge */.E, { variant: "info", children: params.value })),
        },
        {
            field: 'severity',
            headerName: 'Severity',
            sortable: true,
            filter: 'agSetColumnFilter',
            width: 120,
            cellRenderer: (params) => ((0,jsx_runtime.jsx)(Badge/* Badge */.E, { variant: params.value === 'Critical' ? 'danger' :
                    params.value === 'Warning' ? 'warning' :
                        params.value === 'Info' ? 'info' : 'success', children: params.value })),
        },
        {
            field: 'details',
            headerName: 'Details',
            sortable: false,
            filter: 'agTextColumnFilter',
            flex: 1,
        },
        {
            field: 'ipAddress',
            headerName: 'IP Address',
            sortable: true,
            filter: 'agTextColumnFilter',
            width: 140,
        },
        {
            field: 'success',
            headerName: 'Result',
            sortable: true,
            filter: 'agSetColumnFilter',
            width: 100,
            cellRenderer: (params) => ((0,jsx_runtime.jsx)(Badge/* Badge */.E, { variant: params.value ? 'success' : 'danger', children: params.value ? 'Success' : 'Failed' })),
        },
    ];
    return ((0,jsx_runtime.jsxs)("div", { className: "flex flex-col h-full p-6 space-y-6", "data-testid": "audit-log-view", "data-cy": "audit-log-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between items-center", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Audit Log" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: "Track all user actions and system events for compliance and security" })] }), (0,jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Activity */.Ilq, { className: "h-4 w-4" }), onClick: handleRefresh, children: "Refresh" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "h-4 w-4" }), onClick: handleExport, children: "Export Logs" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-5 gap-4", children: [(0,jsx_runtime.jsx)("div", { className: "col-span-2", children: (0,jsx_runtime.jsx)(Input/* Input */.p, { label: "Search", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search by user, action, or details..." }) }), (0,jsx_runtime.jsx)("div", { children: (0,jsx_runtime.jsx)(Select/* Select */.l, { label: "Action", value: actionFilter, onChange: (value) => setActionFilter(value), options: [
                                { value: '', label: 'All Actions' },
                                { value: 'Login', label: 'Login' },
                                { value: 'Logout', label: 'Logout' },
                                { value: 'Create', label: 'Create' },
                                { value: 'Update', label: 'Update' },
                                { value: 'Delete', label: 'Delete' },
                                { value: 'Export', label: 'Export' },
                                { value: 'Import', label: 'Import' },
                                { value: 'Execute', label: 'Execute' },
                            ] }) }), (0,jsx_runtime.jsx)("div", { children: (0,jsx_runtime.jsx)(Select/* Select */.l, { label: "Severity", value: severityFilter, onChange: (value) => setSeverityFilter(value), options: [
                                { value: '', label: 'All Severities' },
                                { value: 'Critical', label: 'Critical' },
                                { value: 'Warning', label: 'Warning' },
                                { value: 'Info', label: 'Info' },
                                { value: 'Success', label: 'Success' },
                            ] }) }), (0,jsx_runtime.jsx)("div", { children: (0,jsx_runtime.jsx)(Select/* Select */.l, { label: "Time Range", value: dateRange, onChange: (value) => setDateRange(value), options: [
                                { value: 'today', label: 'Today' },
                                { value: 'week', label: 'Last 7 Days' },
                                { value: 'month', label: 'Last 30 Days' },
                                { value: 'quarter', label: 'Last 90 Days' },
                                { value: 'all', label: 'All Time' },
                            ] }) })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-5 gap-4", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-blue-600 dark:text-blue-400", children: "Total Events" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-blue-900 dark:text-blue-100", children: (auditLogs ?? []).length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-red-600 dark:text-red-400", children: "Critical" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-red-900 dark:text-red-100", children: (auditLogs ?? []).filter(log => log.severity === 'Critical').length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-yellow-600 dark:text-yellow-400", children: "Warnings" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-yellow-900 dark:text-yellow-100", children: (auditLogs ?? []).filter(log => log.severity === 'Warning').length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-green-600 dark:text-green-400", children: "Success" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-green-900 dark:text-green-100", children: (auditLogs ?? []).filter(log => log.success).length })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Failed" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: (auditLogs ?? []).filter(log => !log.success).length })] })] }), (0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid/* VirtualizedDataGrid */.Q, { data: auditLogs, columns: columns, loading: isLoading }) })] }));
};
/* harmony default export */ const admin_AuditLogView = (AuditLogView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFJLFVBQVUsc0dBQXNHLElBQUksR0FBRyxvQkFBSyxVQUFVLCtHQUErRyxtQkFBSSxVQUFVLDJFQUEyRSxHQUFHLG1CQUFJLFVBQVUsK0lBQStJLElBQUksR0FBRyxvQkFBSyxVQUFVLDJIQUEySCxtQkFBSSxVQUFVLGlGQUFpRixHQUFHLG1CQUFJLFVBQVUsb0pBQW9KLElBQUksR0FBRyxvQkFBSyxVQUFVLHVIQUF1SCxtQkFBSSxVQUFVLDhFQUE4RSxHQUFHLG1CQUFJLFVBQVUsbUlBQW1JLElBQUksR0FBRyxvQkFBSyxVQUFVLG1IQUFtSCxtQkFBSSxVQUFVLDJFQUEyRSxHQUFHLG1CQUFJLFVBQVUsa0lBQWtJLElBQUksSUFBSSxHQUFHLG1CQUFJLFVBQVUsK0JBQStCLG1CQUFJLENBQUMsOENBQW1CLElBQUksdURBQXVELEdBQUcsSUFBSTtBQUN2bEU7QUFDQSx5REFBZSxZQUFZLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VBdWRpdExvZ0xvZ2ljLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3ZpZXdzL2FkbWluL0F1ZGl0TG9nVmlldy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZU5vdGlmaWNhdGlvblN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlTm90aWZpY2F0aW9uU3RvcmUnO1xuaW1wb3J0IGV4cG9ydFNlcnZpY2UgZnJvbSAnLi4vc2VydmljZXMvZXhwb3J0U2VydmljZSc7XG5leHBvcnQgY29uc3QgdXNlQXVkaXRMb2dMb2dpYyA9ICgpID0+IHtcbiAgICBjb25zdCBbYXVkaXRMb2dzLCBzZXRBdWRpdExvZ3NdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3NlYXJjaFF1ZXJ5LCBzZXRTZWFyY2hRdWVyeV0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW2FjdGlvbkZpbHRlciwgc2V0QWN0aW9uRmlsdGVyXSA9IHVzZVN0YXRlKCcnKTtcbiAgICBjb25zdCBbc2V2ZXJpdHlGaWx0ZXIsIHNldFNldmVyaXR5RmlsdGVyXSA9IHVzZVN0YXRlKCcnKTtcbiAgICBjb25zdCBbdXNlckZpbHRlciwgc2V0VXNlckZpbHRlcl0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW2RhdGVSYW5nZSwgc2V0RGF0ZVJhbmdlXSA9IHVzZVN0YXRlKCd3ZWVrJyk7XG4gICAgY29uc3QgeyBhZGROb3RpZmljYXRpb24gfSA9IHVzZU5vdGlmaWNhdGlvblN0b3JlKCk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEF1ZGl0TG9ncygpO1xuICAgIH0sIFtkYXRlUmFuZ2VdKTtcbiAgICBjb25zdCBsb2FkQXVkaXRMb2dzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMTAwMCkpO1xuICAgICAgICAgICAgLy8gR2VuZXJhdGUgbW9jayBhdWRpdCBsb2dzXG4gICAgICAgICAgICBjb25zdCBtb2NrTG9ncyA9IFtdO1xuICAgICAgICAgICAgY29uc3QgYWN0aW9ucyA9IFsnTG9naW4nLCAnTG9nb3V0JywgJ0NyZWF0ZScsICdVcGRhdGUnLCAnRGVsZXRlJywgJ0V4cG9ydCcsICdJbXBvcnQnLCAnRXhlY3V0ZSddO1xuICAgICAgICAgICAgY29uc3QgY2F0ZWdvcmllcyA9IFsnQXV0aGVudGljYXRpb24nLCAnVXNlciBNYW5hZ2VtZW50JywgJ0Rpc2NvdmVyeScsICdNaWdyYXRpb24nLCAnUmVwb3J0cycsICdTeXN0ZW0nXTtcbiAgICAgICAgICAgIGNvbnN0IHNldmVyaXRpZXMgPSBbJ0NyaXRpY2FsJywgJ1dhcm5pbmcnLCAnSW5mbycsICdTdWNjZXNzJ107XG4gICAgICAgICAgICBjb25zdCB1c2VycyA9IFsnYWRtaW4nLCAnanNtaXRoJywgJ21qb25lcycsICdyZGF2aXMnXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNTAwOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgIHRpbWVzdGFtcC5zZXRIb3Vycyh0aW1lc3RhbXAuZ2V0SG91cnMoKSAtIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE2OCkpOyAvLyBMYXN0IHdlZWtcbiAgICAgICAgICAgICAgICBjb25zdCBhY3Rpb24gPSBhY3Rpb25zW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFjdGlvbnMubGVuZ3RoKV07XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VjY2VzcyA9IE1hdGgucmFuZG9tKCkgPiAwLjE7IC8vIDkwJSBzdWNjZXNzIHJhdGVcbiAgICAgICAgICAgICAgICBtb2NrTG9ncy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGBsb2ctJHtpfWAsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcCxcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogdXNlcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdXNlcnMubGVuZ3RoKV0sXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3JpZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2F0ZWdvcmllcy5sZW5ndGgpXSxcbiAgICAgICAgICAgICAgICAgICAgc2V2ZXJpdHk6IHN1Y2Nlc3MgPyAnU3VjY2VzcycgOiBzZXZlcml0aWVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpXSxcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogYCR7YWN0aW9ufSBvcGVyYXRpb24gJHtzdWNjZXNzID8gJ2NvbXBsZXRlZCBzdWNjZXNzZnVsbHknIDogJ2ZhaWxlZCd9YCxcbiAgICAgICAgICAgICAgICAgICAgaXBBZGRyZXNzOiBgMTkyLjE2OC4xLiR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU1KX1gLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTAwMCksXG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlVHlwZTogTWF0aC5yYW5kb20oKSA+IDAuNSA/ICdVc2VyJyA6ICdQcm9qZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VJZDogYHJlcy0ke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMDApfWAsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBTb3J0IGJ5IHRpbWVzdGFtcCBkZXNjZW5kaW5nXG4gICAgICAgICAgICBtb2NrTG9ncy5zb3J0KChhLCBiKSA9PiBiLnRpbWVzdGFtcC5nZXRUaW1lKCkgLSBhLnRpbWVzdGFtcC5nZXRUaW1lKCkpO1xuICAgICAgICAgICAgc2V0QXVkaXRMb2dzKG1vY2tMb2dzKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdlcnJvcicsIG1lc3NhZ2U6ICdGYWlsZWQgdG8gbG9hZCBhdWRpdCBsb2dzJywgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgYXVkaXQgbG9nczonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVFeHBvcnQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZExvZ3MgPSBnZXRGaWx0ZXJlZExvZ3MoKTtcbiAgICAgICAgICAgIGF3YWl0IGV4cG9ydFNlcnZpY2UuZXhwb3J0VG9FeGNlbChmaWx0ZXJlZExvZ3MsICdBdWRpdExvZ3MnKTtcbiAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdzdWNjZXNzJywgbWVzc2FnZTogYEV4cG9ydGVkICR7ZmlsdGVyZWRMb2dzLmxlbmd0aH0gYXVkaXQgbG9nIGVudHJpZXNgLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnZXJyb3InLCBtZXNzYWdlOiAnRmFpbGVkIHRvIGV4cG9ydCBhdWRpdCBsb2dzJywgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVSZWZyZXNoID0gKCkgPT4ge1xuICAgICAgICBsb2FkQXVkaXRMb2dzKCk7XG4gICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdpbmZvJywgbWVzc2FnZTogJ0F1ZGl0IGxvZ3MgcmVmcmVzaGVkJywgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdsb3cnIH0pO1xuICAgIH07XG4gICAgY29uc3QgZ2V0RmlsdGVyZWRMb2dzID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gYXVkaXRMb2dzLmZpbHRlcihsb2cgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlc1NlYXJjaCA9IHNlYXJjaFF1ZXJ5ID09PSAnJyB8fFxuICAgICAgICAgICAgICAgIChsb2cudXNlciA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hRdWVyeS50b0xvd2VyQ2FzZSgpKSB8fFxuICAgICAgICAgICAgICAgIChsb2cuYWN0aW9uID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFF1ZXJ5LnRvTG93ZXJDYXNlKCkpIHx8XG4gICAgICAgICAgICAgICAgKGxvZy5kZXRhaWxzID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFF1ZXJ5LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlc0FjdGlvbiA9IGFjdGlvbkZpbHRlciA9PT0gJycgfHwgbG9nLmFjdGlvbiA9PT0gYWN0aW9uRmlsdGVyO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlc1NldmVyaXR5ID0gc2V2ZXJpdHlGaWx0ZXIgPT09ICcnIHx8IGxvZy5zZXZlcml0eSA9PT0gc2V2ZXJpdHlGaWx0ZXI7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzVXNlciA9IHVzZXJGaWx0ZXIgPT09ICcnIHx8IGxvZy51c2VyID09PSB1c2VyRmlsdGVyO1xuICAgICAgICAgICAgLy8gRGF0ZSByYW5nZSBmaWx0ZXJpbmdcbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICBsZXQgbWF0Y2hlc0RhdGUgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGRhdGVSYW5nZSA9PT0gJ3RvZGF5Jykge1xuICAgICAgICAgICAgICAgIG1hdGNoZXNEYXRlID0gbG9nLnRpbWVzdGFtcC50b0RhdGVTdHJpbmcoKSA9PT0gbm93LnRvRGF0ZVN0cmluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZGF0ZVJhbmdlID09PSAnd2VlaycpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB3ZWVrQWdvID0gbmV3IERhdGUobm93LmdldFRpbWUoKSAtIDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKTtcbiAgICAgICAgICAgICAgICBtYXRjaGVzRGF0ZSA9IGxvZy50aW1lc3RhbXAgPj0gd2Vla0FnbztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGRhdGVSYW5nZSA9PT0gJ21vbnRoJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vbnRoQWdvID0gbmV3IERhdGUobm93LmdldFRpbWUoKSAtIDMwICogMjQgKiA2MCAqIDYwICogMTAwMCk7XG4gICAgICAgICAgICAgICAgbWF0Y2hlc0RhdGUgPSBsb2cudGltZXN0YW1wID49IG1vbnRoQWdvO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZGF0ZVJhbmdlID09PSAncXVhcnRlcicpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBxdWFydGVyQWdvID0gbmV3IERhdGUobm93LmdldFRpbWUoKSAtIDkwICogMjQgKiA2MCAqIDYwICogMTAwMCk7XG4gICAgICAgICAgICAgICAgbWF0Y2hlc0RhdGUgPSBsb2cudGltZXN0YW1wID49IHF1YXJ0ZXJBZ287XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hlc1NlYXJjaCAmJiBtYXRjaGVzQWN0aW9uICYmIG1hdGNoZXNTZXZlcml0eSAmJiBtYXRjaGVzVXNlciAmJiBtYXRjaGVzRGF0ZTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4ge1xuICAgICAgICBhdWRpdExvZ3M6IGdldEZpbHRlcmVkTG9ncygpLFxuICAgICAgICBpc0xvYWRpbmcsXG4gICAgICAgIHNlYXJjaFF1ZXJ5LFxuICAgICAgICBhY3Rpb25GaWx0ZXIsXG4gICAgICAgIHNldmVyaXR5RmlsdGVyLFxuICAgICAgICB1c2VyRmlsdGVyLFxuICAgICAgICBkYXRlUmFuZ2UsXG4gICAgICAgIHNldFNlYXJjaFF1ZXJ5LFxuICAgICAgICBzZXRBY3Rpb25GaWx0ZXIsXG4gICAgICAgIHNldFNldmVyaXR5RmlsdGVyLFxuICAgICAgICBzZXRVc2VyRmlsdGVyLFxuICAgICAgICBzZXREYXRlUmFuZ2UsXG4gICAgICAgIGhhbmRsZUV4cG9ydCxcbiAgICAgICAgaGFuZGxlUmVmcmVzaCxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRG93bmxvYWQsIFVzZXIsIEFjdGl2aXR5IH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IFZpcnR1YWxpemVkRGF0YUdyaWQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9JbnB1dCc7XG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL1NlbGVjdCc7XG5pbXBvcnQgeyBCYWRnZSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQmFkZ2UnO1xuaW1wb3J0IHsgdXNlQXVkaXRMb2dMb2dpYyB9IGZyb20gJy4uLy4uL2hvb2tzL3VzZUF1ZGl0TG9nTG9naWMnO1xuZXhwb3J0IGNvbnN0IEF1ZGl0TG9nVmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IGF1ZGl0TG9ncywgaXNMb2FkaW5nLCBzZWFyY2hRdWVyeSwgYWN0aW9uRmlsdGVyLCBzZXZlcml0eUZpbHRlciwgdXNlckZpbHRlciwgZGF0ZVJhbmdlLCBzZXRTZWFyY2hRdWVyeSwgc2V0QWN0aW9uRmlsdGVyLCBzZXRTZXZlcml0eUZpbHRlciwgc2V0VXNlckZpbHRlciwgc2V0RGF0ZVJhbmdlLCBoYW5kbGVFeHBvcnQsIGhhbmRsZVJlZnJlc2gsIH0gPSB1c2VBdWRpdExvZ0xvZ2ljKCk7XG4gICAgY29uc3QgY29sdW1ucyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICd0aW1lc3RhbXAnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1RpbWVzdGFtcCcsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnRGF0ZUNvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKSxcbiAgICAgICAgICAgIHNvcnQ6ICdkZXNjJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICd1c2VyJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdVc2VyJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goVXNlciwgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LWdyYXktNTAwXCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IHBhcmFtcy52YWx1ZSB9KV0gfSkpLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2FjdGlvbicsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQWN0aW9uJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdTZXRDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgd2lkdGg6IDIwMCxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4gKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBwYXJhbXMudmFsdWUgfSkpLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2NhdGVnb3J5JyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDYXRlZ29yeScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnU2V0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNDAsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IChfanN4KEJhZGdlLCB7IHZhcmlhbnQ6IFwiaW5mb1wiLCBjaGlsZHJlbjogcGFyYW1zLnZhbHVlIH0pKSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdzZXZlcml0eScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnU2V2ZXJpdHknLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1NldENvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICB3aWR0aDogMTIwLFxuICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiAocGFyYW1zKSA9PiAoX2pzeChCYWRnZSwgeyB2YXJpYW50OiBwYXJhbXMudmFsdWUgPT09ICdDcml0aWNhbCcgPyAnZGFuZ2VyJyA6XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtcy52YWx1ZSA9PT0gJ1dhcm5pbmcnID8gJ3dhcm5pbmcnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy52YWx1ZSA9PT0gJ0luZm8nID8gJ2luZm8nIDogJ3N1Y2Nlc3MnLCBjaGlsZHJlbjogcGFyYW1zLnZhbHVlIH0pKSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdkZXRhaWxzJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEZXRhaWxzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICBmbGV4OiAxLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2lwQWRkcmVzcycsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnSVAgQWRkcmVzcycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICB3aWR0aDogMTQwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3N1Y2Nlc3MnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1Jlc3VsdCcsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnU2V0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IChfanN4KEJhZGdlLCB7IHZhcmlhbnQ6IHBhcmFtcy52YWx1ZSA/ICdzdWNjZXNzJyA6ICdkYW5nZXInLCBjaGlsZHJlbjogcGFyYW1zLnZhbHVlID8gJ1N1Y2Nlc3MnIDogJ0ZhaWxlZCcgfSkpLFxuICAgICAgICB9LFxuICAgIF07XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGZsZXgtY29sIGgtZnVsbCBwLTYgc3BhY2UteS02XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJhdWRpdC1sb2ctdmlld1wiLCBcImRhdGEtY3lcIjogXCJhdWRpdC1sb2ctdmlld1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkF1ZGl0IExvZ1wiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIG10LTFcIiwgY2hpbGRyZW46IFwiVHJhY2sgYWxsIHVzZXIgYWN0aW9ucyBhbmQgc3lzdGVtIGV2ZW50cyBmb3IgY29tcGxpYW5jZSBhbmQgc2VjdXJpdHlcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBpY29uOiBfanN4KEFjdGl2aXR5LCB7IGNsYXNzTmFtZTogXCJoLTQgdy00XCIgfSksIG9uQ2xpY2s6IGhhbmRsZVJlZnJlc2gsIGNoaWxkcmVuOiBcIlJlZnJlc2hcIiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgY2xhc3NOYW1lOiBcImgtNCB3LTRcIiB9KSwgb25DbGljazogaGFuZGxlRXhwb3J0LCBjaGlsZHJlbjogXCJFeHBvcnQgTG9nc1wiIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTUgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImNvbC1zcGFuLTJcIiwgY2hpbGRyZW46IF9qc3goSW5wdXQsIHsgbGFiZWw6IFwiU2VhcmNoXCIsIHZhbHVlOiBzZWFyY2hRdWVyeSwgb25DaGFuZ2U6IChlKSA9PiBzZXRTZWFyY2hRdWVyeShlLnRhcmdldC52YWx1ZSksIHBsYWNlaG9sZGVyOiBcIlNlYXJjaCBieSB1c2VyLCBhY3Rpb24sIG9yIGRldGFpbHMuLi5cIiB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNoaWxkcmVuOiBfanN4KFNlbGVjdCwgeyBsYWJlbDogXCJBY3Rpb25cIiwgdmFsdWU6IGFjdGlvbkZpbHRlciwgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gc2V0QWN0aW9uRmlsdGVyKHZhbHVlKSwgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnJywgbGFiZWw6ICdBbGwgQWN0aW9ucycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0xvZ2luJywgbGFiZWw6ICdMb2dpbicgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0xvZ291dCcsIGxhYmVsOiAnTG9nb3V0JyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnQ3JlYXRlJywgbGFiZWw6ICdDcmVhdGUnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdVcGRhdGUnLCBsYWJlbDogJ1VwZGF0ZScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0RlbGV0ZScsIGxhYmVsOiAnRGVsZXRlJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnRXhwb3J0JywgbGFiZWw6ICdFeHBvcnQnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdJbXBvcnQnLCBsYWJlbDogJ0ltcG9ydCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0V4ZWN1dGUnLCBsYWJlbDogJ0V4ZWN1dGUnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNoaWxkcmVuOiBfanN4KFNlbGVjdCwgeyBsYWJlbDogXCJTZXZlcml0eVwiLCB2YWx1ZTogc2V2ZXJpdHlGaWx0ZXIsIG9uQ2hhbmdlOiAodmFsdWUpID0+IHNldFNldmVyaXR5RmlsdGVyKHZhbHVlKSwgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnJywgbGFiZWw6ICdBbGwgU2V2ZXJpdGllcycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0NyaXRpY2FsJywgbGFiZWw6ICdDcml0aWNhbCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ1dhcm5pbmcnLCBsYWJlbDogJ1dhcm5pbmcnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdJbmZvJywgbGFiZWw6ICdJbmZvJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnU3VjY2VzcycsIGxhYmVsOiAnU3VjY2VzcycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIH0pIH0pLCBfanN4KFwiZGl2XCIsIHsgY2hpbGRyZW46IF9qc3goU2VsZWN0LCB7IGxhYmVsOiBcIlRpbWUgUmFuZ2VcIiwgdmFsdWU6IGRhdGVSYW5nZSwgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gc2V0RGF0ZVJhbmdlKHZhbHVlKSwgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAndG9kYXknLCBsYWJlbDogJ1RvZGF5JyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnd2VlaycsIGxhYmVsOiAnTGFzdCA3IERheXMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdtb250aCcsIGxhYmVsOiAnTGFzdCAzMCBEYXlzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAncXVhcnRlcicsIGxhYmVsOiAnTGFzdCA5MCBEYXlzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnYWxsJywgbGFiZWw6ICdBbGwgVGltZScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIH0pIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtNSBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLWJsdWUtNTAgZGFyazpiZy1ibHVlLTkwMC8yMCBwLTQgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWJsdWUtMjAwIGRhcms6Ym9yZGVyLWJsdWUtODAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtYmx1ZS02MDAgZGFyazp0ZXh0LWJsdWUtNDAwXCIsIGNoaWxkcmVuOiBcIlRvdGFsIEV2ZW50c1wiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWJsdWUtOTAwIGRhcms6dGV4dC1ibHVlLTEwMFwiLCBjaGlsZHJlbjogKGF1ZGl0TG9ncyA/PyBbXSkubGVuZ3RoIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctcmVkLTUwIGRhcms6YmctcmVkLTkwMC8yMCBwLTQgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXJlZC0yMDAgZGFyazpib3JkZXItcmVkLTgwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDBcIiwgY2hpbGRyZW46IFwiQ3JpdGljYWxcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1yZWQtOTAwIGRhcms6dGV4dC1yZWQtMTAwXCIsIGNoaWxkcmVuOiAoYXVkaXRMb2dzID8/IFtdKS5maWx0ZXIobG9nID0+IGxvZy5zZXZlcml0eSA9PT0gJ0NyaXRpY2FsJykubGVuZ3RoIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmcteWVsbG93LTUwIGRhcms6YmcteWVsbG93LTkwMC8yMCBwLTQgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXllbGxvdy0yMDAgZGFyazpib3JkZXIteWVsbG93LTgwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LXllbGxvdy02MDAgZGFyazp0ZXh0LXllbGxvdy00MDBcIiwgY2hpbGRyZW46IFwiV2FybmluZ3NcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC15ZWxsb3ctOTAwIGRhcms6dGV4dC15ZWxsb3ctMTAwXCIsIGNoaWxkcmVuOiAoYXVkaXRMb2dzID8/IFtdKS5maWx0ZXIobG9nID0+IGxvZy5zZXZlcml0eSA9PT0gJ1dhcm5pbmcnKS5sZW5ndGggfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1ncmVlbi01MCBkYXJrOmJnLWdyZWVuLTkwMC8yMCBwLTQgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyZWVuLTIwMCBkYXJrOmJvcmRlci1ncmVlbi04MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmVlbi02MDAgZGFyazp0ZXh0LWdyZWVuLTQwMFwiLCBjaGlsZHJlbjogXCJTdWNjZXNzXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JlZW4tOTAwIGRhcms6dGV4dC1ncmVlbi0xMDBcIiwgY2hpbGRyZW46IChhdWRpdExvZ3MgPz8gW10pLmZpbHRlcihsb2cgPT4gbG9nLnN1Y2Nlc3MpLmxlbmd0aCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTkwMC8yMCBwLTQgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktODAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIkZhaWxlZFwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogKGF1ZGl0TG9ncyA/PyBbXSkuZmlsdGVyKGxvZyA9PiAhbG9nLnN1Y2Nlc3MpLmxlbmd0aCB9KV0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMVwiLCBjaGlsZHJlbjogX2pzeChWaXJ0dWFsaXplZERhdGFHcmlkLCB7IGRhdGE6IGF1ZGl0TG9ncywgY29sdW1uczogY29sdW1ucywgbG9hZGluZzogaXNMb2FkaW5nIH0pIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQXVkaXRMb2dWaWV3O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9