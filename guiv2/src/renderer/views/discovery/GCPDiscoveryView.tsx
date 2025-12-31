import { useState } from 'react';
import {
  Cloud,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Server,
  Database,
  HardDrive,
  Network,
  Shield,
  DollarSign,
  Globe,
  Cpu
} from 'lucide-react';

import { useGCPDiscoveryLogic } from '../../hooks/useGCPDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
import { ViewDiscoveredDataButton } from '../../components/molecules/ViewDiscoveredDataButton';

const GCPDiscoveryView: React.FC = () => {
  const {
    config,
    result,
    isDiscovering,
    isCancelling,
    progress,
    activeTab,
    filter,
    error,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
    columns,
    filteredData,
    stats,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    setActiveTab,
    updateFilter,
    clearError,
    exportToCSV,
    exportToExcel
  } = useGCPDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  // Normalize filter to ensure arrays exist
  const normalizedFilter = {
    selectedRegions: Array.isArray(filter?.selectedRegions) ? filter.selectedRegions : [],
    selectedResourceTypes: Array.isArray(filter?.selectedResourceTypes) ? filter.selectedResourceTypes : [],
    searchText: filter?.searchText ?? '',
    showUnlabeledOnly: !!filter?.showUnlabeledOnly,
  };

  // Normalize stats objects for safe iteration
  const resourcesByRegion = stats?.resourcesByRegion && typeof stats.resourcesByRegion === 'object' ? stats.resourcesByRegion : {};
  const resourcesByType = stats?.resourcesByType && typeof stats.resourcesByType === 'object' ? stats.resourcesByType : {};
  const costByService = Array.isArray(stats?.costByService) ? stats.costByService : [];

  // Normalize export payload
  const exportPayload = Array.isArray((result as any)?.data) ? (result as any).data : Array.isArray(result) ? result : [];

  const regions = ['us-central1', 'us-east1', 'us-west1', 'europe-west1', 'europe-west2', 'asia-east1', 'asia-southeast1'];
  const resourceTypes = ['ComputeEngine', 'CloudStorage', 'CloudSQL', 'VPC', 'CloudFunctions', 'GKE', 'BigQuery'];

  const toggleRegion = (region: string) => {
    const current = normalizedFilter.selectedRegions;
    const updated = current.includes(region)
      ? current.filter(r => r !== region)
      : [...current, region];
    updateFilter({ selectedRegions: updated });
  };

  const toggleResourceType = (type: string) => {
    const current = normalizedFilter.selectedResourceTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    updateFilter({ selectedResourceTypes: updated });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="gcp-discovery-view" data-testid="gcp-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering GCP resources...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Cloud className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GCP Cloud Infrastructure Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover Google Cloud Platform resources across regions to assess cloud footprint, optimize costs, and plan migration strategies
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `gcp-discovery-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                aria-label="Export as CSV"
                data-cy="export-csv-btn" data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `gcp-discovery-${new Date().toISOString().split('T')[0]}.xlsx`)}
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
                label="Include Compute Engine"
                checked={config.includeComputeEngine}
                onChange={(checked) => updateConfig({ includeComputeEngine: checked })}
                data-cy="include-compute-checkbox" data-testid="include-compute-checkbox"
              />
              <Checkbox
                label="Include Cloud Storage"
                checked={config.includeCloudStorage}
                onChange={(checked) => updateConfig({ includeCloudStorage: checked })}
                data-cy="include-storage-checkbox" data-testid="include-storage-checkbox"
              />
              <Checkbox
                label="Include Cloud SQL"
                checked={config.includeCloudSQL}
                onChange={(checked) => updateConfig({ includeCloudSQL: checked })}
                data-cy="include-sql-checkbox" data-testid="include-sql-checkbox"
              />
              <Checkbox
                label="Include VPCs"
                checked={config.includeVPC}
                onChange={(checked) => updateConfig({ includeVPC: checked })}
                data-cy="include-vpc-checkbox" data-testid="include-vpc-checkbox"
              />
              <Checkbox
                label="Include GKE Clusters"
                checked={config.includeGKE}
                onChange={(checked) => updateConfig({ includeGKE: checked })}
                data-cy="include-gke-checkbox" data-testid="include-gke-checkbox"
              />
              <Checkbox
                label="Include Cost Data"
                checked={config.includeCostData}
                onChange={(checked) => updateConfig({ includeCostData: checked })}
                data-cy="include-cost-checkbox" data-testid="include-cost-checkbox"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeout (ms)
              </label>
              <Input
                type="number"
                value={config.timeout}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const next = Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : config.timeout;
                  const clamped = Math.max(60000, Math.min(1800000, next));
                  updateConfig({ timeout: clamped });
                }}
                min={60000}
                max={1800000}
                step={60000}
                data-cy="timeout-input" data-testid="timeout-input"
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
              <Cloud className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(typeof stats?.totalResources === 'number' ? stats.totalResources : 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Resources</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Server className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.computeInstances ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Compute Instances</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <HardDrive className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.storageBuckets ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Storage Buckets</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Database className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.sqlInstances ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Cloud SQL Instances</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Network className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.vpcs ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">VPC Networks</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Cpu className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.gkeClusters ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">GKE Clusters</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.projects ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Projects</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <DollarSign className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">${(typeof stats?.monthlyCostEstimate === 'number' ? stats.monthlyCostEstimate : 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Est. Monthly Cost</div>
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
            <Cloud className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('compute')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'compute'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-compute" data-testid="tab-compute"
          >
            <Server className="w-4 h-4" />
            Compute Engine
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.computeInstances ?? 0}</span>}
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
            <HardDrive className="w-4 h-4" />
            Cloud Storage
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.storageBuckets ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'sql'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-sql" data-testid="tab-sql"
          >
            <Database className="w-4 h-4" />
            Cloud SQL
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.sqlInstances ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'network'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-network" data-testid="tab-network"
          >
            <Network className="w-4 h-4" />
            Network
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.vpcs ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('cost')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'cost'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-cost" data-testid="tab-cost"
          >
            <DollarSign className="w-4 h-4" />
            Cost Analysis
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || (stats?.totalResources ?? 0) === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Cloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No GCP Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view GCP resource statistics and insights.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && (stats?.totalResources ?? 0) > 0 && (
          <div className="space-y-6 overflow-auto">
            {/* Resources by Region */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resources by Region</h3>
              <div className="space-y-3">
                {Object.entries(resourcesByRegion).map(([region, count]) => (
                  <div key={region} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">{region}</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                        style={{ width: `${(stats?.totalResources ?? 0) > 0 ? (count / (stats?.totalResources ?? 0)) * 100 : 0}%` }}
                      >
                        {count > 0 && `${count}`}
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                      {(stats?.totalResources ?? 0) > 0 ? ((count / (stats?.totalResources ?? 0)) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources by Type */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resources by Type</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(resourcesByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                    <span className="text-lg font-bold text-blue-600">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Cost Services */}
            {costByService.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Cost Services</h3>
                <div className="space-y-2">
                  {costByService.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.service}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">${item.cost.toLocaleString()}/mo</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View Discovered Data Button */}
            <ViewDiscoveredDataButton
              moduleId="gcp"
              recordCount={stats?.totalResources || 0}
              disabled={!result || exportPayload.length === 0}
            />
          </div>
        )}

        {activeTab !== 'overview' && (
          <>
            {/* Filters */}
            <div className="mb-4 space-y-4">
              <Input
                value={normalizedFilter.searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  const timeoutId = setTimeout(() => {
                    updateFilter({ searchText: value });
                  }, 150);
                  return () => clearTimeout(timeoutId);
                }}
                placeholder="Search..."
                data-cy="search-input" data-testid="search-input"
              />

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Region</label>
                  <div className="flex flex-wrap gap-2">
                    {regions.map(region => (
                      <button
                        key={region}
                        onClick={() => toggleRegion(region)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          filter.selectedRegions?.includes(region)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        data-cy={`filter-region-${region}`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Resource Type</label>
                  <div className="flex flex-wrap gap-2">
                    {resourceTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => toggleResourceType(type)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          filter.selectedResourceTypes?.includes(type)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        data-cy={`filter-type-${type.toLowerCase()}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <Checkbox
                  label="Show Unlabeled Resources Only"
                  checked={normalizedFilter.showUnlabeledOnly}
                  onChange={(checked) => updateFilter({ showUnlabeledOnly: checked })}
                  data-cy="show-unlabeled-checkbox" data-testid="show-unlabeled-checkbox"
                />
              </div>
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid
                data={Array.isArray(filteredData) ? filteredData as any[] : []}
                columns={Array.isArray(columns) ? columns : []}
                loading={isDiscovering}
                enableColumnReorder
                enableColumnResize
                data-cy={isDiscovering ? "grid-loading" : undefined}
              />
            </div>
          </>
        )}
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="GCP Discovery"
        scriptDescription="Discovering Google Cloud Platform resources, costs, and configuration"
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

export default GCPDiscoveryView;
