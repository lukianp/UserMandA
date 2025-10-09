import React from 'react';
import { FileText, Download, Filter, Calendar, User, Activity } from 'lucide-react';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import { Badge } from '../../components/atoms/Badge';
import { useAuditLogLogic } from '../../hooks/useAuditLogLogic';

export const AuditLogView: React.FC = () => {
  const {
    auditLogs,
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
  } = useAuditLogLogic();

  const columns = [
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      sortable: true,
      filter: 'agDateColumnFilter',
      width: 180,
      valueFormatter: (params: any) => new Date(params.value).toLocaleString(),
      sort: 'desc' as const,
    },
    {
      field: 'user',
      headerName: 'User',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 150,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <span>{params.value}</span>
        </div>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      sortable: true,
      filter: 'agSetColumnFilter',
      width: 200,
      cellRenderer: (params: any) => (
        <span className="font-medium">{params.value}</span>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      sortable: true,
      filter: 'agSetColumnFilter',
      width: 140,
      cellRenderer: (params: any) => (
        <Badge variant="info">{params.value}</Badge>
      ),
    },
    {
      field: 'severity',
      headerName: 'Severity',
      sortable: true,
      filter: 'agSetColumnFilter',
      width: 120,
      cellRenderer: (params: any) => (
        <Badge
          variant={

            params.value === 'Critical' ? 'danger' :
            params.value === 'Warning' ? 'warning' :
            params.value === 'Info' ? 'info' : 'success'
          }
        >
          {params.value}
        </Badge>
      ),
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
      cellRenderer: (params: any) => (
        <Badge variant={params.value ? 'success' : 'danger'}>
          {params.value ? 'Success' : 'Failed'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Log</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track all user actions and system events for compliance and security
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Activity className="h-4 w-4" />} onClick={handleRefresh}>
            Refresh
          </Button>
          <Button variant="primary" icon={<Download className="h-4 w-4" />} onClick={handleExport}>
            Export Logs
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2">
          <Input
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user, action, or details..."
          />
        </div>
        <div>
          <Select
            label="Action"
            value={actionFilter}
            onChange={(value) => setActionFilter(value)}
            options={[
              { value: '', label: 'All Actions' },
              { value: 'Login', label: 'Login' },
              { value: 'Logout', label: 'Logout' },
              { value: 'Create', label: 'Create' },
              { value: 'Update', label: 'Update' },
              { value: 'Delete', label: 'Delete' },
              { value: 'Export', label: 'Export' },
              { value: 'Import', label: 'Import' },
              { value: 'Execute', label: 'Execute' },
            ]}
          />
        </div>
        <div>
          <Select
            label="Severity"
            value={severityFilter}
            onChange={(value) => setSeverityFilter(value)}
            options={[
              { value: '', label: 'All Severities' },
              { value: 'Critical', label: 'Critical' },
              { value: 'Warning', label: 'Warning' },
              { value: 'Info', label: 'Info' },
              { value: 'Success', label: 'Success' },
            ]}
          />
        </div>
        <div>
          <Select
            label="Time Range"
            value={dateRange}
            onChange={(value) => setDateRange(value)}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'Last 7 Days' },
              { value: 'month', label: 'Last 30 Days' },
              { value: 'quarter', label: 'Last 90 Days' },
              { value: 'all', label: 'All Time' },
            ]}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-600 dark:text-blue-400">Total Events</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {auditLogs.length}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-sm text-red-600 dark:text-red-400">Critical</div>
          <div className="text-2xl font-bold text-red-900 dark:text-red-100">
            {auditLogs.filter(log => log.severity === 'Critical').length}
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Warnings</div>
          <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            {auditLogs.filter(log => log.severity === 'Warning').length}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-400">Success</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {auditLogs.filter(log => log.success).length}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {auditLogs.filter(log => !log.success).length}
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="flex-1">
        <VirtualizedDataGrid
          data={auditLogs}
          columns={columns}
          loading={isLoading}
        />
      </div>
    </div>
  );
};


export default AuditLogView;
