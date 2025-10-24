/**
 * BulkOperationsView Component
 *
 * Comprehensive bulk operations management interface with operation scheduling,
 * progress tracking, batch processing, and detailed operation analytics for
 * enterprise-scale data manipulation and system administration.
 *
 * Epic 0: Production Views - Advanced bulk operations management system
 * Features full operation lifecycle management, progress monitoring, and analytics.
 *
 * @component
 * @example
 * ```tsx
 * <BulkOperationsView />
 * ```
 */

import React, { useState, useCallback } from 'react';
import {
  Plus,
  Settings,
  Search,
  ListFilter,
  Play,
  Pause,
  Square,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
  BarChart3
} from 'lucide-react';

import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import { ModernCard } from '../../components/atoms/ModernCard';
import DataTable from '../../components/organisms/DataTable';
import LoadingSpinner from '../../components/atoms/LoadingSpinner';

import { useBulkOperationsLogic } from '../../hooks/useBulkOperationsLogic';

export const BulkOperationsView: React.FC = () => {
  const {
    operations,
    selectedItems,
    isLoading,
    error,
    selectItem,
    selectAll,
    clearSelection,
    startOperation,
    cancelOperation,
    retryOperation,
    clearCompleted,
    refreshOperations,
  } = useBulkOperationsLogic();

  const [statusFilter, setStatusFilter] = useState<'All' | 'pending' | 'running' | 'completed' | 'failed'>('All');
  const [searchText, setSearchText] = useState('');

  // Table columns
  const operationColumns: any[] = [
    {
      id: 'name',
      header: 'Operation Name',
      accessor: 'name',
      sortable: true,
      cell: (value: string, row: any) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{row.description}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (value: string) => {
        const statusConfig = {
          pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
          running: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Activity },
          completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
          failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
        };
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.pending;
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
      id: 'progress',
      header: 'Progress',
      accessor: 'progress',
      sortable: true,
      cell: (value: number) => (
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${value}%` }}
          />
        </div>
      ),
    },
    {
      id: 'affectedItems',
      header: 'Items',
      accessor: 'affectedItems',
      sortable: true,
      align: 'right' as const,
    },
    {
      id: 'startTime',
      header: 'Started',
      accessor: 'startTime',
      sortable: true,
      cell: (value: Date) => value ? value.toLocaleString() : '-',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          {row.status === 'running' && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Square className="w-4 h-4" />}
              onClick={() => cancelOperation(row.id)}
              data-cy={`cancel-${row.id}`}
            >
              Cancel
            </Button>
          )}
          {row.status === 'failed' && (
            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={() => retryOperation(row.id)}
              data-cy={`retry-${row.id}`}
            >
              Retry
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => cancelOperation(row.id)}
            data-cy={`delete-${row.id}`}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleStartBulkOperation = useCallback(async () => {
    if (selectedItems.length === 0) return;
    await startOperation('Bulk Update', selectedItems);
    clearSelection();
  }, [selectedItems, startOperation, clearSelection]);

  const handleBulkActions = useCallback((action: string) => {
    switch (action) {
      case 'cancel':
        operations.filter(op => op.status === 'running').forEach(op => cancelOperation(op.id));
        break;
      case 'retry':
        operations.filter(op => op.status === 'failed').forEach(op => retryOperation(op.id));
        break;
      case 'clear':
        clearCompleted();
        break;
    }
  }, [operations, cancelOperation, retryOperation, clearCompleted]);

  const filteredOperations = operations.filter(op => {
    const matchesStatus = statusFilter === 'All' || op.status === statusFilter;
    const matchesSearch = op.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         op.description.toLowerCase().includes(searchText.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full p-6 space-y-6" data-cy="bulk-operations-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bulk Operations</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor bulk operations across your infrastructure
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => console.log('Import operations')}
            data-cy="import-operations"
          >
            Import
          </Button>
          <Button
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={() => console.log('Export operations')}
            data-cy="export-operations"
          >
            Export
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleStartBulkOperation}
            disabled={selectedItems.length === 0}
            data-cy="start-bulk-operation"
          >
            Start Operation
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernCard variant="metric">
          <div className="flex items-center gap-3">
            <ListFilter className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Operations</p>
              <p className="text-2xl font-bold">{operations.length}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard variant="metric">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Running</p>
              <p className="text-2xl font-bold">{operations.filter(op => op.status === 'running').length}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard variant="metric">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold">{operations.filter(op => op.status === 'completed').length}</p>
            </div>
          </div>
        </ModernCard>
        <ModernCard variant="metric">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold">{operations.filter(op => op.status === 'failed').length}</p>
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

      {/* Operations Table */}
      <ModernCard className="h-full p-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search operations..."
                startIcon={<Search className="w-4 h-4" />}
                data-cy="search-operations"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as any)}
              options={[
                { value: 'All', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'running', label: 'Running' },
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' },
              ]}
              data-cy="status-filter"
            />
            {operations.some(op => op.status === 'running' || op.status === 'failed') && (
              <Select
                value=""
                onChange={handleBulkActions}
                options={[
                  { value: 'cancel', label: 'Cancel Running' },
                  { value: 'retry', label: 'Retry Failed' },
                  { value: 'clear', label: 'Clear Completed' },
                ]}
                placeholder="Bulk Actions"
                data-cy="bulk-actions"
              />
            )}
          </div>
        </div>
        <div className="flex-1">
          <DataTable
            data={filteredOperations}
            columns={operationColumns}
            loading={isLoading}
            emptyMessage="No operations found"
            contextMenu={true}
            data-cy="operations-table"
          />
        </div>
      </ModernCard>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ModernCard className="p-6">
            <div className="flex items-center gap-3">
              <LoadingSpinner />
              <span>Processing bulk operations...</span>
            </div>
          </ModernCard>
        </div>
      )}
    </div>
  );
};

export default BulkOperationsView;
