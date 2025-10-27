/**
 * AssetLifecycleView Component
 *
 * Comprehensive asset lifecycle management interface with procurement tracking,
 * maintenance scheduling, lifecycle analytics, and replacement planning for
 * enterprise asset management and IT infrastructure lifecycle optimization.
 *
 * Epic 0: Production Views - Advanced asset lifecycle management system
 * Features full lifecycle tracking, cost analysis, and replacement planning.
 *
 * @component
 * @example
 * ```tsx
 * <AssetLifecycleView />
 * ```
 */

import React, { useState, useCallback } from 'react';
import {
  Plus,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
  Wrench,
  Download
} from 'lucide-react';

import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import { ModernCard } from '../../components/atoms/ModernCard';
import DataTable from '../../components/organisms/DataTable';
import LoadingSpinner from '../../components/atoms/LoadingSpinner';

import { useAssetLifecycleLogic } from '../../hooks/useAssetLifecycleLogic';

export const AssetLifecycleView: React.FC = () => {
  const {
    data,
    selectedItems,
    searchText,
    setSearchText,
    isLoading,
    error,
    exportData,
    refreshData,
  } = useAssetLifecycleLogic();

  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Planned' | 'Retired'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Hardware' | 'Software' | 'Cloud Service' | 'License'>('All');
  const [stageFilter, setStageFilter] = useState<'All' | 'Planning' | 'Procurement' | 'Deployment' | 'Maintenance' | 'End of Life' | 'Retirement'>('All');

  // Asset table columns
  const assetColumns: any[] = [
    {
      id: 'name',
      header: 'Asset Name',
      accessor: 'name',
      sortable: true,
      cell: (value: string, row: any) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{row.type}</div>
        </div>
      ),
    },
    {
      id: 'lifecycleStage',
      header: 'Lifecycle Stage',
      accessor: 'lifecycleStage',
      sortable: true,
      cell: (value: string) => {
        const stageConfig = {
          'Planning': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
          'Procurement': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
          'Deployment': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
          'Maintenance': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
          'End of Life': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
          'Retirement': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
        };
        const config = stageConfig[value as keyof typeof stageConfig] || stageConfig.Planning;

        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
            {value}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (value: string) => {
        const statusConfig = {
          Active: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
          Inactive: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: Clock },
          Planned: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Calendar },
          Retired: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: AlertTriangle },
        };
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.Inactive;
        const Icon = config.icon;

        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {value}
          </span>
        );
      },
    },
    {
      id: 'remainingLifespan',
      header: 'Remaining Life',
      accessor: 'remainingLifespan',
      sortable: true,
      align: 'right' as const,
      cell: (value: number) => {
        const isNegative = value < 0;
        return (
          <span className={`font-medium ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {isNegative ? `${Math.abs(value)} months overdue` : `${value} months`}
          </span>
        );
      },
    },
    {
      id: 'replacementCost',
      header: 'Replacement Cost',
      accessor: 'replacementCost',
      sortable: true,
      align: 'right' as const,
      cell: (value: number) => value ? `$${value.toLocaleString()}` : '-',
    },
    {
      id: 'priority',
      header: 'Priority',
      accessor: 'priority',
      sortable: true,
      cell: (value: string) => {
        const priorityConfig = {
          Low: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
          Medium: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
          High: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
          Critical: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
        };
        const config = priorityConfig[value as keyof typeof priorityConfig] || priorityConfig.Low;

        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
            {value}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => handleViewAsset(row)}
            data-cy={`view-asset-${row.id}`}
          >
            View
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEditAsset(row)}
            data-cy={`edit-asset-${row.id}`}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<MoreHorizontal className="w-4 h-4" />}
            onClick={() => handleAssetActions(row)}
            data-cy={`more-actions-${row.id}`}
          />
        </div>
      ),
    },
  ];

  const handleCreateAsset = useCallback(async () => {
    // Implementation for creating asset
    console.log('Create asset');
  }, []);

  const handleEditAsset = useCallback((asset: any) => {
    // Implementation for editing asset
    console.log('Edit asset:', asset);
  }, []);

  const handleAssetActions = useCallback((asset: any) => {
    // Implementation for asset actions menu
    console.log('Asset actions:', asset);
  }, []);

  const handleViewAsset = useCallback((asset: any) => {
    // Implementation for viewing asset details
    console.log('View asset:', asset);
  }, []);

  const handleBulkActions = useCallback((action: string) => {
    if (action === 'delete') {
      console.log('Delete selected assets');
    } else if (action === 'retire') {
      console.log('Retire selected assets');
    } else if (action === 'maintenance') {
      console.log('Schedule maintenance for selected assets');
    }
  }, [selectedItems]);

  const filteredData = (data ?? []).filter(asset => {
    const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
    const matchesType = typeFilter === 'All' || asset.type === typeFilter;
    const matchesStage = stageFilter === 'All' || asset.lifecycleStage === stageFilter;
    const matchesSearch = (asset.name ?? '')?.toLowerCase() ?? "".includes(searchText?.toLowerCase() ?? "") ||
                         (asset.type ?? '')?.toLowerCase() ?? "".includes(searchText?.toLowerCase() ?? "");
    return matchesStatus && matchesType && matchesStage && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    totalAssets: (data ?? []).length,
    activeAssets: (data ?? []).filter(a => a.status === 'Active').length,
    criticalAssets: (data ?? []).filter(a => a.priority === 'Critical').length,
    totalReplacementCost: (data ?? []).reduce((sum, a) => sum + (a.replacementCost || 0), 0),
    assetsNeedingReplacement: (data ?? []).filter(a => (a.remainingLifespan || 0) <= 6).length,
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6" data-cy="asset-lifecycle-view" data-testid="asset-lifecycle-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Asset Lifecycle</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage asset lifecycle, track maintenance, and plan replacements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<DollarSign className="w-4 h-4" />}
            onClick={() => console.log('Cost analysis')}
            data-cy="cost-analysis" data-testid="cost-analysis"
          >
            Cost Analysis
          </Button>
          <Button
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={exportData}
            data-cy="export-assets" data-testid="export-assets"
          >
            Export
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreateAsset}
            data-cy="create-asset" data-testid="create-asset"
          >
            Add Asset
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <ModernCard variant="metric">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assets</p>
              <p className="text-2xl font-bold">{stats.totalAssets}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard variant="metric">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Assets</p>
              <p className="text-2xl font-bold">{stats.activeAssets}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard variant="metric">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical Assets</p>
              <p className="text-2xl font-bold">{stats.criticalAssets}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard variant="metric">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Replacement Cost</p>
              <p className="text-2xl font-bold">${stats.totalReplacementCost.toLocaleString()}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard variant="metric">
          <div className="flex items-center gap-3">
            <Wrench className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Need Replacement</p>
              <p className="text-2xl font-bold">{stats.assetsNeedingReplacement}</p>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Error Display */}
      {error && (
        <ModernCard variant="glass">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </ModernCard>
      )}

      {/* Asset Table */}
      <ModernCard className="h-full p-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search assets..."
                startIcon={<Search className="w-4 h-4" />}
                data-cy="search-assets" data-testid="search-assets"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as any)}
              options={[
                { value: 'All', label: 'All Status' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
                { value: 'Planned', label: 'Planned' },
                { value: 'Retired', label: 'Retired' },
              ]}
              data-cy="status-filter" data-testid="status-filter"
            />
            <Select
              value={typeFilter}
              onChange={(value) => setTypeFilter(value as any)}
              options={[
                { value: 'All', label: 'All Types' },
                { value: 'Hardware', label: 'Hardware' },
                { value: 'Software', label: 'Software' },
                { value: 'Cloud Service', label: 'Cloud Service' },
                { value: 'License', label: 'License' },
              ]}
              data-cy="type-filter" data-testid="type-filter"
            />
            <Select
              value={stageFilter}
              onChange={(value) => setStageFilter(value as any)}
              options={[
                { value: 'All', label: 'All Stages' },
                { value: 'Planning', label: 'Planning' },
                { value: 'Procurement', label: 'Procurement' },
                { value: 'Deployment', label: 'Deployment' },
                { value: 'Maintenance', label: 'Maintenance' },
                { value: 'End of Life', label: 'End of Life' },
                { value: 'Retirement', label: 'Retirement' },
              ]}
              data-cy="stage-filter" data-testid="stage-filter"
            />
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedItems.length} selected
                </span>
                <Select
                  value=""
                  onChange={handleBulkActions}
                  options={[
                    { value: 'maintenance', label: 'Schedule Maintenance' },
                    { value: 'retire', label: 'Mark for Retirement' },
                    { value: 'delete', label: 'Delete' },
                  ]}
                  placeholder="Bulk Actions"
                  data-cy="bulk-actions" data-testid="bulk-actions"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <DataTable
            data={filteredData}
            columns={assetColumns}
            selectable={true}
            onSelectionChange={() => {}} // TODO: Implement selection
            loading={isLoading}
            emptyMessage="No assets found"
            contextMenu={true}
            onViewDetails={(asset) => handleEditAsset(asset)}
            getDetailViewTitle={(asset) => `Edit Asset: ${asset.name}`}
            detailViewComponent="AssetDesignerView"
            data-cy="assets-table" data-testid="assets-table"
          />
        </div>
      </ModernCard>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ModernCard className="p-6">
            <div className="flex items-center gap-3">
              <LoadingSpinner />
              <span>Loading asset lifecycle data...</span>
            </div>
          </ModernCard>
        </div>
      )}
    </div>
  );
};

export default AssetLifecycleView;
