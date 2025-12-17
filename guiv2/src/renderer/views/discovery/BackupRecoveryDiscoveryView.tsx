import { useState, useMemo } from 'react';
import {
  HardDrive,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Server,
  Archive
} from 'lucide-react';

import { useBackupRecoveryDiscoveryLogic } from '../../hooks/useBackupRecoveryDiscoveryLogic';
import { VirtualizedDataGrid, Column } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const BackupRecoveryDiscoveryView: React.FC = () => {
  const {
    config,
    result,
    isDiscovering,
    isCancelling,
    progress,
    error,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    clearError,
  } = useBackupRecoveryDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'backup-jobs' | 'recovery-points' | 'history' | 'storage'>('overview');
  const [searchText, setSearchText] = useState('');

  // Statistics
  const stats = useMemo(() => {
    if (!result) return null;

    return {
      totalBackupJobs: result.totalBackupJobs || 0,
      totalRecoveryPoints: result.totalRecoveryPoints || 0,
      totalBackupSize: result.statistics?.totalBackupSize || 0,
      successfulBackups: result.statistics?.successfulBackups || 0,
      failedBackups: result.statistics?.failedBackups || 0,
      averageBackupDuration: result.statistics?.averageBackupDuration || 0,
      successRate: result.statistics?.successfulBackups && result.statistics?.failedBackups
        ? ((result.statistics.successfulBackups / (result.statistics.successfulBackups + result.statistics.failedBackups)) * 100)
        : 0,
    };
  }, [result]);

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = (data: any[], filename: string) => {
    console.log('Export to Excel:', filename, data);
  };

  // Data grid columns
  const backupJobColumns: Column[] = [
    { key: 'name', label: 'Job Name', width: 200, sortable: true },
    { key: 'status', label: 'Status', width: 120, sortable: true },
    { key: 'lastRun', label: 'Last Run', width: 180, sortable: true },
    { key: 'nextRun', label: 'Next Run', width: 180, sortable: true },
    { key: 'size', label: 'Size (GB)', width: 120, sortable: true },
    { key: 'duration', label: 'Duration (min)', width: 140, sortable: true },
  ];

  const recoveryPointColumns: Column[] = [
    { key: 'name', label: 'Recovery Point', width: 200, sortable: true },
    { key: 'created', label: 'Created', width: 180, sortable: true },
    { key: 'size', label: 'Size (GB)', width: 120, sortable: true },
    { key: 'type', label: 'Type', width: 120, sortable: true },
  ];

  const historyColumns: Column[] = [
    { key: 'jobName', label: 'Job Name', width: 200, sortable: true },
    { key: 'timestamp', label: 'Timestamp', width: 180, sortable: true },
    { key: 'status', label: 'Status', width: 120, sortable: true },
    { key: 'size', label: 'Size (GB)', width: 120, sortable: true },
    { key: 'duration', label: 'Duration (min)', width: 140, sortable: true },
    { key: 'error', label: 'Error', width: 300, sortable: true },
  ];

  const storageColumns: Column[] = [
    { key: 'name', label: 'Storage Location', width: 200, sortable: true },
    { key: 'type', label: 'Type', width: 120, sortable: true },
    { key: 'capacity', label: 'Capacity (GB)', width: 140, sortable: true },
    { key: 'used', label: 'Used (GB)', width: 120, sortable: true },
    { key: 'free', label: 'Free (GB)', width: 120, sortable: true },
    { key: 'utilization', label: 'Utilization %', width: 140, sortable: true },
  ];

  // Filtered data
  const filteredBackupJobs = useMemo(() => {
    if (!result?.backupJobs) return [];
    if (!searchText) return result.backupJobs;
    return result.backupJobs.filter((job: any) =>
      job.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [result, searchText]);

  const filteredRecoveryPoints = useMemo(() => {
    if (!result?.recoveryPoints) return [];
    if (!searchText) return result.recoveryPoints;
    return result.recoveryPoints.filter((point: any) =>
      point.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [result, searchText]);

  const filteredHistory = useMemo(() => {
    if (!result?.backupHistory) return [];
    if (!searchText) return result.backupHistory;
    return result.backupHistory.filter((item: any) =>
      item.jobName?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [result, searchText]);

  const filteredStorage = useMemo(() => {
    if (!result?.storageLocations) return [];
    if (!searchText) return result.storageLocations;
    return result.storageLocations.filter((location: any) =>
      location.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [result, searchText]);

  // Export payload
  const exportPayload = useMemo(() => {
    switch (activeTab) {
      case 'backup-jobs':
        return filteredBackupJobs;
      case 'recovery-points':
        return filteredRecoveryPoints;
      case 'history':
        return filteredHistory;
      case 'storage':
        return filteredStorage;
      default:
        return [];
    }
  }, [activeTab, filteredBackupJobs, filteredRecoveryPoints, filteredHistory, filteredStorage]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="backup-recovery-discovery-view" data-testid="backup-recovery-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering backup and recovery systems...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <HardDrive className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Backup & Recovery Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover backup infrastructure, recovery points, and backup job history to assess data protection strategy
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `backup-recovery-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                aria-label="Export as CSV"
                data-cy="export-csv-btn" data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `backup-recovery-${activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`)}
                variant="secondary"
                icon={<FileSpreadsheet className="w-4 h-4" />}
                aria-label="Export as Excel"
                data-cy="export-excel-btn" data-testid="export-excel-btn"
              >
                Export Excel
              </Button>
            </>
          )}
          <Button
            onClick={startDiscovery}
            disabled={isDiscovering}
            variant="primary"
            aria-label="Start discovery"
            data-cy="start-discovery-btn" data-testid="start-discovery-btn"
          >
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <Button onClick={clearError} variant="ghost" size="sm">Dismiss</Button>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="mx-6 mt-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setConfigExpanded(!configExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          data-cy="config-toggle" data-testid="config-toggle"
        >
          <span className="font-semibold text-gray-900 dark:text-white">Discovery Configuration</span>
          {configExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {configExpanded && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Checkbox
                label="Include Backup Jobs"
                checked={config.includeBackupJobs}
                onChange={(checked) => updateConfig({ includeBackupJobs: checked })}
                data-cy="include-backup-jobs-checkbox" data-testid="include-backup-jobs-checkbox"
              />
              <Checkbox
                label="Include Recovery Points"
                checked={config.includeRecoveryPoints}
                onChange={(checked) => updateConfig({ includeRecoveryPoints: checked })}
                data-cy="include-recovery-points-checkbox" data-testid="include-recovery-points-checkbox"
              />
              <Checkbox
                label="Include Backup History"
                checked={config.includeBackupHistory}
                onChange={(checked) => updateConfig({ includeBackupHistory: checked })}
                data-cy="include-backup-history-checkbox" data-testid="include-backup-history-checkbox"
              />
              <Checkbox
                label="Include Storage Locations"
                checked={config.includeStorageLocations}
                onChange={(checked) => updateConfig({ includeStorageLocations: checked })}
                data-cy="include-storage-locations-checkbox" data-testid="include-storage-locations-checkbox"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max History Days
              </label>
              <Input
                type="number"
                value={config.maxHistoryDays}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = parseInt(e.target.value, 10);
                  updateConfig({ maxHistoryDays: isNaN(value) ? 30 : value });
                }}
                min={1}
                max={365}
                data-cy="max-history-days-input" data-testid="max-history-days-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Archive className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalBackupJobs.toLocaleString()}</div>
                <div className="text-sm opacity-90">Backup Jobs</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.successfulBackups.toLocaleString()}</div>
                <div className="text-sm opacity-90">Successful Backups</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <XCircle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.failedBackups.toLocaleString()}</div>
                <div className="text-sm opacity-90">Failed Backups</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Database className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.successRate.toFixed(1)}%</div>
                <div className="text-sm opacity-90">Success Rate</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Server className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalRecoveryPoints.toLocaleString()}</div>
                <div className="text-sm opacity-90">Recovery Points</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <HardDrive className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats.totalBackupSize / 1024).toFixed(1)}</div>
                <div className="text-sm opacity-90">Total Size (TB)</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Clock className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.averageBackupDuration.toFixed(0)}</div>
                <div className="text-sm opacity-90">Avg Duration (min)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-overview" data-testid="tab-overview"
          >
            <HardDrive className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('backup-jobs')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'backup-jobs'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-backup-jobs" data-testid="tab-backup-jobs"
          >
            <Archive className="w-4 h-4" />
            Backup Jobs
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalBackupJobs}</span>}
          </button>
          <button
            onClick={() => setActiveTab('recovery-points')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'recovery-points'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-recovery-points" data-testid="tab-recovery-points"
          >
            <Server className="w-4 h-4" />
            Recovery Points
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalRecoveryPoints}</span>}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-history" data-testid="tab-history"
          >
            <Clock className="w-4 h-4" />
            History
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'storage'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-storage" data-testid="tab-storage"
          >
            <Database className="w-4 h-4" />
            Storage
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || stats.totalBackupJobs === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <HardDrive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Backup Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view backup and recovery statistics.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && stats.totalBackupJobs > 0 && (
          <div className="space-y-6 overflow-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Backup Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Backup Jobs</span>
                  <span className="text-lg font-bold text-blue-600">{stats.totalBackupJobs}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Recovery Points</span>
                  <span className="text-lg font-bold text-green-600">{stats.totalRecoveryPoints}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Success Rate</span>
                  <span className="text-lg font-bold text-purple-600">{stats.successRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <>
            {/* Search */}
            <div className="mb-4">
              <Input
                value={searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                placeholder="Search..."
                data-cy="search-input" data-testid="search-input"
              />
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {activeTab === 'backup-jobs' && (
                <VirtualizedDataGrid
                  data={filteredBackupJobs}
                  columns={backupJobColumns}
                  loading={isDiscovering}
                  enableColumnReorder
                  enableColumnResize
                  data-cy={isDiscovering ? "grid-loading" : undefined}
                />
              )}
              {activeTab === 'recovery-points' && (
                <VirtualizedDataGrid
                  data={filteredRecoveryPoints}
                  columns={recoveryPointColumns}
                  loading={isDiscovering}
                  enableColumnReorder
                  enableColumnResize
                  data-cy={isDiscovering ? "grid-loading" : undefined}
                />
              )}
              {activeTab === 'history' && (
                <VirtualizedDataGrid
                  data={filteredHistory}
                  columns={historyColumns}
                  loading={isDiscovering}
                  enableColumnReorder
                  enableColumnResize
                  data-cy={isDiscovering ? "grid-loading" : undefined}
                />
              )}
              {activeTab === 'storage' && (
                <VirtualizedDataGrid
                  data={filteredStorage}
                  columns={storageColumns}
                  loading={isDiscovering}
                  enableColumnReorder
                  enableColumnResize
                  data-cy={isDiscovering ? "grid-loading" : undefined}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Backup & Recovery Discovery"
        scriptDescription="Discovering backup infrastructure, recovery points, and backup job history"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? {
          percentage: progress.percentage || 0,
          message: progress.message || 'Processing...'
        } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

export default BackupRecoveryDiscoveryView;
