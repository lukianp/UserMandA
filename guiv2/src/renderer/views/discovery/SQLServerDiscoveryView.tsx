import React from 'react';
import { Database, Play, Download, FileText, AlertCircle, CheckCircle2, HardDrive } from 'lucide-react';
import { useSQLServerDiscoveryLogic } from '../../hooks/useSQLServerDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const ConfigBadge: React.FC<{ label: string; value: boolean | string | number }> = ({ label, value }) => (
  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-md text-xs font-medium">
    <span className="text-emerald-500 dark:text-emerald-400">•</span>
    <span>{label}:</span>
    <span className="font-semibold">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
  </div>
);

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}> = ({ icon, label, value, subValue, variant = 'default' }) => {
  const colors = {
    default: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    success: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
    danger: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg ${colors[variant]}`}>
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm opacity-80">{label}</div>
        {subValue && <div className="text-xs opacity-60 mt-0.5">{subValue}</div>}
      </div>
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
      active
        ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
    }`}
  >
    {children}
  </button>
);

const OverviewTab: React.FC<{ data: any }> = ({ data }) => {
  const SummaryRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Discovery Summary</h3>
        <div className="space-y-1">
          <SummaryRow label="Start Time" value={new Date(data.startTime).toLocaleString()} />
          <SummaryRow label="End Time" value={new Date(data.endTime).toLocaleString()} />
          <SummaryRow label="Duration" value={`${Math.round((new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) / 60000)} minutes`} />
          <SummaryRow label="Status" value={data.status} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Database Statistics</h3>
        <div className="space-y-1">
          <SummaryRow label="Total Instances" value={data.instances?.length || 0} />
          <SummaryRow label="Total Databases" value={data.databases?.length || 0} />
          <SummaryRow label="Configurations" value={data.configurations?.length || 0} />
        </div>
      </div>
    </div>
  );
};

const SQLServerDiscoveryView: React.FC = () => {
  const {
    config,
    setConfig,
    result,
    isLoading,
    progress,
    error,
    searchText,
    setSearchText,
    activeTab,
    setActiveTab,
    templates,
    handleStartDiscovery,
    handleApplyTemplate,
    handleExport,
    filteredInstances,
    filteredDatabases,
    instanceColumns,
    databaseColumns,
    stats,
  } = useSQLServerDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="sqlserver-discovery-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">SQL Server Discovery</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Discover SQL Server instances, databases, and configurations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value=""
            onChange={(value) => {
              const template = templates.find((t) => t.name === value);
              if (template) handleApplyTemplate(template);
            }}
            options={[
              { value: '', label: 'Select Template...' },
              ...templates.map((template) => ({
                value: template.name,
                label: template.name,
              })),
            ]}
            data-cy="template-select"
          />
          <Button
            onClick={handleStartDiscovery}
            disabled={isLoading}
            variant="primary"
            icon={<Play />}
            data-cy="start-discovery-btn"
          >
            {isLoading ? 'Discovering...' : 'Start Discovery'}
          </Button>
          {result && (
            <Button onClick={handleExport} icon={<Download />} data-cy="export-btn">
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          <ConfigBadge label="System DBs" value={config.includeSystemDatabases} />
          <ConfigBadge label="Backup History" value={config.includeBackupHistory} />
          <ConfigBadge label="DB Files" value={config.includeDatabaseFiles} />
          <ConfigBadge label="Security Audit" value={config.includeSecurityAudit} />
          <ConfigBadge label="Performance" value={config.includePerformanceMetrics} />
          <ConfigBadge label="Configuration" value={config.includeConfiguration} />
          <ConfigBadge label="Authentication" value={config.authenticationType} />
        </div>
      </div>

      {/* Progress Bar */}
      {isLoading && (
        <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-900/10">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-emerald-700 dark:text-emerald-300 font-medium">Discovery in progress...</span>
                <span className="text-emerald-600 dark:text-emerald-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 dark:text-red-100">Discovery Failed</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && stats && (
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Database />}
                label="Total Instances"
                value={stats?.totalInstances ?? 0}
                subValue={`${stats?.activeInstances ?? 0} active`}
                variant="default"
              />
              <StatCard
                icon={<FileText />}
                label="Databases"
                value={stats?.totalDatabases ?? 0}
                variant="default"
              />
              <StatCard
                icon={<HardDrive />}
                label="Storage"
                value={formatBytes(stats.totalStorageMB * 1024 * 1024)}
                variant="default"
              />
              <StatCard
                icon={<AlertCircle />}
                label="Backup Status"
                value={stats?.outdatedBackups ?? 0}
                subValue={stats.outdatedBackups > 0 ? 'databases need backup' : 'all up to date'}
                variant={stats.outdatedBackups > 0 ? 'warning' : 'success'}
              />
            </div>

            {/* Tabs */}
            <div>
              <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                  Overview
                </TabButton>
                <TabButton active={activeTab === 'instances'} onClick={() => setActiveTab('instances')}>
                  Instances ({filteredInstances.length})
                </TabButton>
                <TabButton active={activeTab === 'databases'} onClick={() => setActiveTab('databases')}>
                  Databases ({filteredDatabases.length})
                </TabButton>
              </div>

              <div className="mt-4">
                {activeTab === 'overview' && <OverviewTab data={result} />}

                {activeTab !== 'overview' && (
                  <>
                    {/* Search Bar */}
                    <div className="mb-4 flex gap-2">
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="flex-1"
                        data-cy="search-input"
                      />
                    </div>

                    {/* Data Grid */}
                    <div className="h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      {activeTab === 'instances' && (
                        <VirtualizedDataGrid
                          data={filteredInstances}
                          columns={instanceColumns}
                          loading={isLoading}
                          enableExport
                          data-cy="sqlserver-instances-grid"
                        />
                      )}
                      {activeTab === 'databases' && (
                        <VirtualizedDataGrid
                          data={filteredDatabases}
                          columns={databaseColumns}
                          loading={isLoading}
                          enableExport
                          data-cy="sqlserver-databases-grid"
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Database className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No SQL Server Discovery Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Start Discovery" to scan your SQL Server infrastructure
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SQLServerDiscoveryView;
