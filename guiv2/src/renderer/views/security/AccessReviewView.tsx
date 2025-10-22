/**
 * Access Review View
 * Enterprise access governance and certification workflows
 */

import React, { useState, useMemo } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  Lock,
  Activity,
  Download,
  Filter,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';

import { useAccessReviewLogic } from '../../hooks/security/useAccessReviewLogic';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import type { AccessReviewItem, BulkReviewAction } from '../../types/models/accessReview';

export const AccessReviewView: React.FC = () => {
  const {
    reviewData,
    isLoading,
    error,
    lastRefresh,
    activeFilter,
    handleRefresh,
    handleFilterChange,
    handleBulkAction,
    handleExportData,
  } = useAccessReviewLogic();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'campaigns' | 'resources' | 'users'>('items');

  // Metric cards configuration
  const metricCards = useMemo(() => {
    if (!reviewData) return [];
    const { metrics } = reviewData;

    return [
      {
        label: 'Total Access Items',
        value: metrics.totalAccessItems.toLocaleString(),
        icon: Shield,
        color: 'blue' as const,
        description: 'All access assignments',
      },
      {
        label: 'Pending Reviews',
        value: metrics.pendingReviews.toLocaleString(),
        icon: Clock,
        color: 'yellow' as const,
        description: 'Awaiting certification',
      },
      {
        label: 'Critical Access',
        value: metrics.criticalAccess.toLocaleString(),
        icon: AlertTriangle,
        color: 'red' as const,
        description: 'High-risk assignments',
      },
      {
        label: 'Compliance Score',
        value: `${metrics.complianceScore}%`,
        icon: CheckCircle2,
        color: metrics.complianceScore >= 80 ? 'green' as const : 'yellow' as const,
        description: 'Review completion rate',
      },
    ];
  }, [reviewData]);

  // Access items column definitions
  const accessItemColumns = useMemo(() => [
    {
      field: 'userDisplayName',
      headerName: 'User',
      width: 200,
      pinned: 'left' as const,
    },
    {
      field: 'resourceName',
      headerName: 'Resource',
      width: 250,
    },
    {
      field: 'resourceType',
      headerName: 'Type',
      width: 130,
      cellRenderer: (params: ICellRendererParams) => (
        <Badge variant="default" size="sm">
          {params.value}
        </Badge>
      ),
    },
    {
      field: 'accessLevel',
      headerName: 'Access Level',
      width: 140,
      cellRenderer: (params: ICellRendererParams) => {
        const isHighPrivilege = ['Admin', 'Owner', 'FullControl'].includes(params.value);
        return (
          <Badge variant={isHighPrivilege ? 'danger' : 'default'} size="sm">
            {params.value}
          </Badge>
        );
      },
    },
    {
      field: 'riskLevel',
      headerName: 'Risk',
      width: 120,
      cellRenderer: (params: ICellRendererParams) => {
        const variantMap: Record<string, 'danger' | 'warning' | 'success' | 'default'> = {
          Critical: 'danger',
          High: 'danger',
          Medium: 'warning',
          Low: 'success',
        };
        return (
          <Badge variant={variantMap[params.value] || 'default'} size="sm">
            {params.value}
          </Badge>
        );
      },
    },
    {
      field: 'reviewStatus',
      headerName: 'Review Status',
      width: 140,
      cellRenderer: (params: any) => {
        const variantMap: Record<string, 'success' | 'danger' | 'warning' | 'default'> = {
          Approved: 'success',
          Denied: 'danger',
          Pending: 'warning',
          Expired: 'default',
          Revoked: 'danger',
        };
        return (
          <Badge variant={variantMap[params.value] || 'default'} size="sm">
            {params.value}
          </Badge>
        );
      },
    },
    {
      field: 'assignmentType',
      headerName: 'Assignment',
      width: 130,
    },
    {
      field: 'lastUsedDate',
      headerName: 'Last Used',
      width: 150,
      valueFormatter: (params: any) => {
        if (!params.value) return 'Never';
        const date = new Date(params.value);
        return date.toLocaleDateString();
      },
    },
    {
      field: 'isStale',
      headerName: 'Stale',
      width: 100,
      cellRenderer: (params: any) => (
        params.value ? <Badge variant="warning" size="sm">Yes</Badge> : <span className="text-gray-500">-</span>
      ),
    },
    {
      field: 'isCritical',
      headerName: 'Critical',
      width: 110,
      cellRenderer: (params: any) => (
        params.value ? <Badge variant="danger" size="sm">Yes</Badge> : <span className="text-gray-500">-</span>
      ),
    },
  ], []);

  // Campaign column definitions
  const campaignColumns = useMemo(() => [
    {
      field: 'name',
      headerName: 'Campaign',
      width: 300,
      pinned: 'left' as const,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      cellRenderer: (params: any) => {
        const variantMap: Record<string, 'success' | 'warning' | 'default'> = {
          Completed: 'success',
          InProgress: 'warning',
          Draft: 'default',
          Cancelled: 'default',
        };
        return (
          <Badge variant={variantMap[params.value] || 'default'} size="sm">
            {params.value}
          </Badge>
        );
      },
    },
    {
      field: 'scope',
      headerName: 'Scope',
      width: 150,
    },
    {
      field: 'completionPercentage',
      headerName: 'Progress',
      width: 150,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${params.value}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{params.value}%</span>
        </div>
      ),
    },
    {
      field: 'reviewedItems',
      headerName: 'Reviewed',
      width: 130,
      valueFormatter: (params: any) => {
        const row = params.data;
        return `${params.value} / ${row.totalItems}`;
      },
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 150,
      valueFormatter: (params: any) => {
        const date = new Date(params.value);
        return date.toLocaleDateString();
      },
    },
  ], []);

  // Resource summary columns
  const resourceColumns = useMemo(() => [
    {
      field: 'resourceName',
      headerName: 'Resource',
      width: 300,
      pinned: 'left' as const,
    },
    {
      field: 'resourceType',
      headerName: 'Type',
      width: 150,
    },
    {
      field: 'totalUsers',
      headerName: 'Total Users',
      width: 130,
    },
    {
      field: 'privilegedUsers',
      headerName: 'Privileged',
      width: 130,
    },
    {
      field: 'staleAccessCount',
      headerName: 'Stale Access',
      width: 130,
    },
    {
      field: 'riskLevel',
      headerName: 'Risk',
      width: 120,
      cellRenderer: (params: any) => {
        const variantMap: Record<string, 'danger' | 'warning' | 'success' | 'default'> = {
          Critical: 'danger',
          High: 'danger',
          Medium: 'warning',
          Low: 'success',
        };
        return (
          <Badge variant={variantMap[params.value] || 'default'} size="sm">
            {params.value}
          </Badge>
        );
      },
    },
    {
      field: 'requiresReview',
      headerName: 'Requires Review',
      width: 140,
      cellRenderer: (params: any) => (
        params.value ? <Badge variant="warning" size="sm">Yes</Badge> : <span className="text-gray-500">-</span>
      ),
    },
  ], []);

  // User summary columns
  const userColumns = useMemo(() => [
    {
      field: 'userDisplayName',
      headerName: 'User',
      width: 250,
      pinned: 'left' as const,
    },
    {
      field: 'totalAccess',
      headerName: 'Total Access',
      width: 130,
    },
    {
      field: 'criticalAccess',
      headerName: 'Critical',
      width: 110,
    },
    {
      field: 'privilegedAccess',
      headerName: 'Privileged',
      width: 120,
    },
    {
      field: 'staleAccess',
      headerName: 'Stale',
      width: 100,
    },
    {
      field: 'pendingReviews',
      headerName: 'Pending',
      width: 110,
    },
    {
      field: 'riskScore',
      headerName: 'Risk Score',
      width: 120,
      cellRenderer: (params: any) => {
        const score = params.value;
        const color = score > 70 ? 'red' : score > 40 ? 'yellow' : 'green';
        return (
          <span className={`font-semibold text-${color}-600 dark:text-${color}-400`}>
            {score}
          </span>
        );
      },
    },
    {
      field: 'isHighRisk',
      headerName: 'High Risk',
      width: 110,
      cellRenderer: (params: any) => (
        params.value ? <Badge variant="danger" size="sm">Yes</Badge> : <span className="text-gray-500">-</span>
      ),
    },
  ], []);

  const handleBulkApprove = async () => {
    const action: BulkReviewAction = {
      action: 'Approve',
      itemIds: selectedItems,
      comments: 'Bulk approval via Access Review dashboard',
    };
    await handleBulkAction(action);
    setSelectedItems([]);
  };

  const handleBulkDeny = async () => {
    const action: BulkReviewAction = {
      action: 'Deny',
      itemIds: selectedItems,
      comments: 'Bulk denial via Access Review dashboard',
    };
    await handleBulkAction(action);
    setSelectedItems([]);
  };

  const handleExport = async () => {
    await handleExportData('Excel');
  };

  if (isLoading && !reviewData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading access review data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertTriangle className="w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Error Loading Data</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button variant="primary" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!reviewData) return null;

  return (
    <div className="flex flex-col h-full p-6 bg-gray-50 dark:bg-gray-900" data-cy="access-review-view">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Access Review</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enterprise access governance and certification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            icon={<RefreshCw className="w-4 h-4" />}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={handleExport}
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metricCards.map((metric) => (
          <div
            key={metric.label}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.label}
              </span>
              <div className={`p-2 bg-${metric.color}-100 dark:bg-${metric.color}-900 rounded`}>
                <metric.icon className={`w-5 h-5 text-${metric.color}-600 dark:text-${metric.color}-400`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {metric.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {metric.description}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'items'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Access Items ({reviewData.accessItems.length})
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'campaigns'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Campaigns ({reviewData.campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'resources'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Resources ({reviewData.resourceSummaries.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'users'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Users ({reviewData.userSummaries.length})
        </button>
      </div>

      {/* Bulk Actions */}
      {activeTab === 'items' && (selectedItems?.length ?? 0) > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {(selectedItems?.length ?? 0)} item(s) selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button variant="primary" size="sm" onClick={handleBulkApprove}>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button variant="danger" size="sm" onClick={handleBulkDeny}>
              <XCircle className="w-4 h-4 mr-1" />
              Deny
            </Button>
          </div>
        </div>
      )}

      {/* Data Grid */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {activeTab === 'items' && (
          <VirtualizedDataGrid
            data={reviewData.accessItems}
            columns={accessItemColumns}
          />
        )}
        {activeTab === 'campaigns' && (
          <VirtualizedDataGrid
            data={reviewData.campaigns}
            columns={campaignColumns}
          />
        )}
        {activeTab === 'resources' && (
          <VirtualizedDataGrid
            data={reviewData.resourceSummaries}
            columns={resourceColumns}
          />
        )}
        {activeTab === 'users' && (
          <VirtualizedDataGrid
            data={reviewData.userSummaries}
            columns={userColumns}
          />
        )}
      </div>
    </div>
  );
};

export default AccessReviewView;
