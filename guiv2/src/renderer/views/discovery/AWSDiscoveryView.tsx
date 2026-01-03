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
import { ViewDiscoveredDataButton } from '../../components/molecules/ViewDiscoveredDataButton';

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
    setConfig,
    setActiveTab,
    setFilter,
    exportToCSV,
    exportToExcel
  } = useAWSDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  // Normalize filter to ensure arrays exist
  const normalizedFilter = {
    selectedRegions: Array.isArray(filter?.selectedRegions) ? filter.selectedRegions : [],
    selectedResourceTypes: Array.isArray(filter?.selectedResourceTypes) ? filter.selectedResourceTypes : [],
    searchText: filter?.searchText ?? '',
    showOnlySecurityRisks: !!filter?.showOnlySecurityRisks,
  };

  // Normalize stats objects for safe iteration (these don't exist in current hook)
  const resourcesByRegion: Record<string, number> = {};
  const resourcesByType: Record<string, number> = {};
  const costByService: any[] = [];

  // Normalize export payload
  const exportPayload = Array.isArray((result as any)?.data) ? (result as any).data : Array.isArray(result) ? result : [];

  const regions = ['us-east-1', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1'];
  const resourceTypes = ['EC2', 'S3', 'RDS', 'VPC', 'Lambda', 'EBS', 'ELB', 'SecurityGroup'];

  const toggleRegion = (region: string) => {
    const current = normalizedFilter.selectedRegions;
    const updated = current.includes(region)
      ? current.filter(r => r !== region)
      : [...current, region];
    setFilter({ selectedRegions: updated });
  };

  const toggleResourceType = (type: string) => {
    const current = normalizedFilter.selectedResourceTypes as string[];
    const updated = current.includes(type)
      ? current.filter((t: string) => t !== type)
      : [...current, type];
    setFilter({ selectedResourceTypes: updated as any });
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="aws-discovery-view" data-testid="aws-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress === 'number' ? progress : 0}
          onCancel={cancelDiscovery || undefined}
          message={'Discovering AWS resources...'}
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
                onClick={exportToCSV}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                aria-label="Export as CSV"
                data-cy="export-csv-btn" data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={exportToExcel}
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
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <span className="text-red-800 dark:text-red-200">{error}</span>
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
                label="Include Tag Details"
                checked={config.includeTagDetails}
                onChange={(checked) => setConfig({ includeTagDetails: checked })}
                data-cy="include-tag-details-checkbox" data-testid="include-tag-details-checkbox"
              />
              <Checkbox
                label="Include Cost Estimates"
                checked={config.includeCostEstimates}
                onChange={(checked) => setConfig({ includeCostEstimates: checked })}
                data-cy="include-cost-estimates-checkbox" data-testid="include-cost-estimates-checkbox"
              />
              <Checkbox
                label="Include Security Analysis"
                checked={config.includeSecurityAnalysis}
                onChange={(checked) => setConfig({ includeSecurityAnalysis: checked })}
                data-cy="include-security-analysis-checkbox" data-testid="include-security-analysis-checkbox"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeout (ms)
              </label>
              <Input
                type="number"
                value={config.timeout || 300000}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const next = Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : (config.timeout || 300000);
                  const clamped = Math.max(60000, Math.min(1800000, next));
                  setConfig({ timeout: clamped });
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
                <div className="text-3xl font-bold">{(stats?.ec2Count ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">EC2 Instances</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <HardDrive className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.s3Count ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">S3 Buckets</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Database className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.rdsCount ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">RDS Databases</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Network className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(result?.vpcs?.length ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">VPCs</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(result?.lambdaFunctions?.length ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Lambda Functions</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(Array.isArray(result?.regions) ? result.regions.length : 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Active Regions</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <DollarSign className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">${(typeof stats?.estimatedCost === 'number' ? stats.estimatedCost : 0).toLocaleString()}</div>
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
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.ec2Count ?? 0}</span>}
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
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.s3Count ?? 0}</span>}
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
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.rdsCount ?? 0}</span>}
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
                {Object.entries(resourcesByRegion).map(([region, count]: [string, number]) => (
                  <div key={region} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">{region}</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-orange-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                        style={{ width: `${(stats?.totalResources ?? 0) > 0 ? (Number(count) / (stats?.totalResources ?? 0)) * 100 : 0}%` }}
                      >
                        {Number(count) > 0 && `${count}`}
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                      {(stats?.totalResources ?? 0) > 0 ? ((Number(count) / (stats?.totalResources ?? 0)) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources by Type */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resources by Type</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(resourcesByType).map(([type, count]: [string, number]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                    <span className="text-lg font-bold text-orange-600">
                      {String(count)}
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
                  {costByService.map((item: any, index: number) => (
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
              moduleId="aws"
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
                    setFilter({ searchText: value });
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
                          normalizedFilter.selectedRegions.includes(region)
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
                          normalizedFilter.selectedResourceTypes.includes(type as any)
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
                  label="Show Security Risks Only"
                  checked={normalizedFilter.showOnlySecurityRisks}
                  onChange={(checked) => setFilter({ showOnlySecurityRisks: checked })}
                  data-cy="show-security-risks-checkbox" data-testid="show-security-risks-checkbox"
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
        progress={typeof progress === 'number' ? {
          percentage: progress,
          message: 'Processing...'
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
