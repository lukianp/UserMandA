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
  AlertTriangle
} from 'lucide-react';

import { useAWSDiscoveryLogic } from '../../hooks/useAWSDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const AWSDiscoveryView: React.FC = () => {
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
  } = useAWSDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  // Normalize filter to ensure arrays exist
  const normalizedFilter = {
    selectedRegions: Array.isArray(filter?.selectedRegions) ? filter.selectedRegions : [],
    selectedResourceTypes: Array.isArray(filter?.selectedResourceTypes) ? filter.selectedResourceTypes : [],
    searchText: filter?.searchText ?? '',
    showUntaggedOnly: !!filter?.showUntaggedOnly,
  };

  // Normalize stats objects for safe iteration
  const resourcesByRegion = stats?.resourcesByRegion && typeof stats.resourcesByRegion === 'object' ? stats.resourcesByRegion : {};
  const resourcesByType = stats?.resourcesByType && typeof stats.resourcesByType === 'object' ? stats.resourcesByType : {};
  const costByService = Array.isArray(stats?.costByService) ? stats.costByService : [];

  // Normalize export payload
  const exportPayload = Array.isArray((result as any)?.data) ? (result as any).data : Array.isArray(result) ? result : [];

  const regions = ['us-east-1', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1'];
  const resourceTypes = ['EC2', 'S3', 'RDS', 'VPC', 'Lambda', 'EBS', 'ELB', 'SecurityGroup'];

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
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="aws-discovery-view" data-testid="aws-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering AWS resources...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Cloud className="w-8 h-8 text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AWS Cloud Infrastructure Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover AWS resources across regions to assess cloud footprint, optimize costs, and plan migration strategies
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `aws-discovery-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                aria-label="Export as CSV"
                data-cy="export-csv-btn" data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `aws-discovery-${new Date().toISOString().split('T')[0]}.xlsx`)}
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
                label="Include EC2 Instances"
                checked={config.includeEC2}
                onChange={(checked) => updateConfig({ includeEC2: checked })}
                data-cy="include-ec2-checkbox" data-testid="include-ec2-checkbox"
              />
              <Checkbox
                label="Include S3 Buckets"
                checked={config.includeS3}
                onChange={(checked) => updateConfig({ includeS3: checked })}
                data-cy="include-s3-checkbox" data-testid="include-s3-checkbox"
              />
              <Checkbox
                label="Include RDS Databases"
                checked={config.includeRDS}
                onChange={(checked) => updateConfig({ includeRDS: checked })}
                data-cy="include-rds-checkbox" data-testid="include-rds-checkbox"
              />
              <Checkbox
                label="Include VPCs"
                checked={config.includeVPC}
                onChange={(checked) => updateConfig({ includeVPC: checked })}
                data-cy="include-vpc-checkbox" data-testid="include-vpc-checkbox"
              />
              <Checkbox
                label="Include Lambda Functions"
                checked={config.includeLambda}
                onChange={(checked) => updateConfig({ includeLambda: checked })}
                data-cy="include-lambda-checkbox" data-testid="include-lambda-checkbox"
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
          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Cloud className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(typeof stats?.totalResources === 'number' ? stats.totalResources : 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Resources</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Server className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.ec2Instances ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">EC2 Instances</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <HardDrive className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.s3Buckets ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">S3 Buckets</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Database className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.rdsInstances ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">RDS Databases</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Network className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.vpcs ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">VPCs</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.securityGroups ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Security Groups</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.activeRegions ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Active Regions</div>
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
            onClick={() => setActiveTab('ec2')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'ec2'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-ec2" data-testid="tab-ec2"
          >
            <Server className="w-4 h-4" />
            EC2 Instances
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.ec2Instances ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('s3')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 's3'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-s3" data-testid="tab-s3"
          >
            <HardDrive className="w-4 h-4" />
            S3 Buckets
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.s3Buckets ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('rds')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'rds'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-rds" data-testid="tab-rds"
          >
            <Database className="w-4 h-4" />
            RDS Databases
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.rdsInstances ?? 0}</span>}
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No AWS Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view AWS resource statistics and insights.</p>
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
                        className="bg-orange-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
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
                    <span className="text-lg font-bold text-orange-600">
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
                  label="Show Untagged Resources Only"
                  checked={normalizedFilter.showUntaggedOnly}
                  onChange={(checked) => updateFilter({ showUntaggedOnly: checked })}
                  data-cy="show-untagged-checkbox" data-testid="show-untagged-checkbox"
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
        scriptName="AWS Discovery"
        scriptDescription="Discovering AWS cloud resources, costs, and configuration"
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

export default AWSDiscoveryView;
