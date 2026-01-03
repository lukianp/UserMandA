/**
 * AWS Cloud Infrastructure Discovery View
 * Production-grade UI for discovering and analyzing AWS resources across multiple regions
 */

import { useState } from 'react';
import {
  Cloud, Server, Database, Settings, Download, Play, Square,
  ChevronDown, ChevronUp, AlertTriangle, DollarSign, Shield, FileText
} from 'lucide-react';

import { useAWSDiscoveryLogic } from '../../hooks/useAWSDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import ProgressBar from '../../components/molecules/ProgressBar';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
import { ViewDiscoveredDataButton } from '../../components/molecules/ViewDiscoveredDataButton';

/**
 * AWS Cloud Infrastructure Discovery View Component
 */
const AWSCloudInfrastructureDiscoveryView = () => {
  const {
    config,
    setConfig,
    result,
    isDiscovering,
    isCancelling,
    progress,
    error,
    filter,
    setFilter,
    startDiscovery,
    cancelDiscovery,
    exportToCSV,
    exportToExcel,
    activeTab: hookActiveTab,
    setActiveTab: setHookActiveTab,
    columns,
    filteredData,
    stats,
    logs,
    clearLogs,
    showExecutionDialog,
    setShowExecutionDialog,
  } = useAWSDiscoveryLogic();

  // Local UI state - extended tab type to include 'logs'
  type UITabType = 'overview' | 'ec2' | 's3' | 'rds' | 'logs';
  const [activeTab, setActiveTab] = useState<UITabType>('overview');
  const [showConfig, setShowConfig] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Sync hook tab with UI tab for data tabs
  const handleTabChange = (tab: UITabType) => {
    setActiveTab(tab);
    if (tab !== 'logs') {
      setHookActiveTab(tab);
    }
  };

  /**
   * Validate configuration before starting discovery
   */
  const handleStartDiscovery = () => {
    const errors: string[] = [];

    if (!config.accessKeyId || (config?.accessKeyId?.trim?.() ?? '') === '') {
      errors.push('AWS Access Key ID is required');
    }

    if (!config.secretAccessKey || (config?.secretAccessKey?.trim?.() ?? '') === '') {
      errors.push('AWS Secret Access Key is required');
    }

    if (!config.awsRegions || (config?.awsRegions?.length ?? 0) === 0) {
      errors.push('At least one AWS region must be selected');
    }

    if (!config.resourceTypes || (config?.resourceTypes?.length ?? 0) === 0) {
      errors.push('At least one resource type must be selected');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    startDiscovery();
  };

  /**
   * Toggle resource type selection
   */
  const toggleResourceType = (type: string) => {
    const current = config.resourceTypes || [];
    if (current.includes(type as any)) {
      setConfig({ resourceTypes: current.filter(t => t !== type) as any });
    } else {
      setConfig({ resourceTypes: [...current, type] as any });
    }
  };

  /**
   * Toggle region selection
   */
  const toggleRegion = (region: string) => {
    const current = config.awsRegions || [];
    if (current.includes(region)) {
      setConfig({ awsRegions: current.filter(r => r !== region) });
    } else {
      setConfig({ awsRegions: [...current, region] });
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="aws-cloud-infrastructure-discovery-view" data-testid="aws-cloud-infrastructure-discovery-view">
      {/* Loading Overlay */}
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress === 'number' ? progress : 0}
          onCancel={cancelDiscovery}
          message="Discovering AWS resources..."
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
            <Cloud size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AWS Cloud Infrastructure Discovery
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover cloud infrastructure to assess workload portability and plan hybrid cloud optimization
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {result && (() => {
            const exportPayload = Array.isArray((result as any)?.data)
              ? (result as any).data
              : Array.isArray(result as any)
              ? (result as any)
              : [];
            return (
              <>
                <Button
                  variant="secondary"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => exportToCSV()}
                  disabled={isDiscovering || exportPayload.length === 0}
                  data-cy="export-csv-btn" data-testid="export-csv-btn"
                >
                  Export CSV
                </Button>
                <Button
                  variant="secondary"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => exportToExcel()}
                  disabled={isDiscovering || exportPayload.length === 0}
                  data-cy="export-excel-btn" data-testid="export-excel-btn"
                >
                  Export Excel
                </Button>
              </>
            );
          })()}
          <Button
            variant="primary"
            onClick={handleStartDiscovery}
            disabled={isDiscovering}
            data-cy="start-discovery-btn" data-testid="start-discovery-btn"
          >
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {isDiscovering && progress > 0 && (
        <div className="mx-6 mt-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Discovery in progress...
              </span>
              <span className="text-sm text-orange-700 dark:text-orange-300">
                {progress}% complete
              </span>
            </div>
            <ProgressBar value={progress} max={100} />
          </div>
        </div>
      )}

      {/* Error Display */}
      {(error || validationErrors.length > 0) && (
        <div className="mx-6 mt-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                  {error ? 'Discovery Error' : 'Configuration Errors'}
                </h3>
                {error && <p className="text-sm text-red-700 dark:text-red-300">{error}</p>}
                {validationErrors.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                    {validationErrors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="mx-6 mt-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
          data-cy="config-toggle" data-testid="config-toggle"
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900 dark:text-gray-100">Discovery Configuration</span>
            {config.accessKeyId && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                • Access Key: <span className="font-medium text-orange-600 dark:text-orange-400">{config.accessKeyId.substring(0, 8)}...</span>
                {config.awsRegions && config.awsRegions.length > 0 && (
                  <span className="ml-2">• {config.awsRegions.length} region(s)</span>
                )}
              </span>
            )}
          </div>
          {showConfig ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {showConfig && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-6">
              {/* Credentials Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">AWS Credentials</h3>
                <Input
                  label="Access Key ID"
                  value={config.accessKeyId || ''}
                  onChange={(e) => setConfig({ accessKeyId: e.target.value })}
                  placeholder="AKIA..."
                  required
                  disabled={isDiscovering}
                  data-cy="access-key-input" data-testid="access-key-input"
                />
                <Input
                  label="Secret Access Key"
                  type="password"
                  value={config.secretAccessKey || ''}
                  onChange={(e) => setConfig({ secretAccessKey: e.target.value })}
                  placeholder="Enter secret key"
                  required
                  disabled={isDiscovering}
                  data-cy="secret-key-input" data-testid="secret-key-input"
                />
              </div>

              {/* Regions Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">AWS Regions</h3>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded-lg">
                  {['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-west-2', 'eu-central-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1'].map((region) => (
                    <Checkbox
                      key={region}
                      label={region}
                      checked={config.awsRegions?.includes(region) || false}
                      onChange={() => toggleRegion(region)}
                      disabled={isDiscovering}
                      data-cy={`region-${region}`}
                    />
                  ))}
                </div>
              </div>

              {/* Resource Types Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Resource Types</h3>
                <div className="space-y-2">
                  <Checkbox
                    label="EC2 Instances"
                    checked={config.resourceTypes?.includes('ec2') || false}
                    onChange={() => toggleResourceType('ec2')}
                    disabled={isDiscovering}
                    data-cy="resource-ec2" data-testid="resource-ec2"
                  />
                  <Checkbox
                    label="S3 Buckets"
                    checked={config.resourceTypes?.includes('s3') || false}
                    onChange={() => toggleResourceType('s3')}
                    disabled={isDiscovering}
                    data-cy="resource-s3" data-testid="resource-s3"
                  />
                  <Checkbox
                    label="RDS Databases"
                    checked={config.resourceTypes?.includes('rds') || false}
                    onChange={() => toggleResourceType('rds')}
                    disabled={isDiscovering}
                    data-cy="resource-rds" data-testid="resource-rds"
                  />
                  <Checkbox
                    label="Lambda Functions"
                    checked={config.resourceTypes?.includes('lambda') || false}
                    onChange={() => toggleResourceType('lambda')}
                    disabled={isDiscovering}
                    data-cy="resource-lambda" data-testid="resource-lambda"
                  />
                </div>
              </div>

              {/* Options Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Discovery Options</h3>
                <div className="space-y-2">
                  <Checkbox
                    label="Include Tag Details"
                    checked={config.includeTagDetails || false}
                    onChange={(checked) => setConfig({ includeTagDetails: checked })}
                    disabled={isDiscovering}
                    data-cy="option-tags" data-testid="option-tags"
                  />
                  <Checkbox
                    label="Include Cost Estimates"
                    checked={config.includeCostEstimates || false}
                    onChange={(checked) => setConfig({ includeCostEstimates: checked })}
                    disabled={isDiscovering}
                    data-cy="option-costs" data-testid="option-costs"
                  />
                  <Checkbox
                    label="Include Security Analysis"
                    checked={config.includeSecurityAnalysis || false}
                    onChange={(checked) => setConfig({ includeSecurityAnalysis: checked })}
                    disabled={isDiscovering}
                    data-cy="option-security" data-testid="option-security"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="mx-6 mt-4 grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <Cloud className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-2xl font-bold">{stats?.totalResources ?? 0}</p>
              <p className="text-sm opacity-90">Total Resources</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <Server className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-2xl font-bold">{stats?.ec2Count ?? 0}</p>
              <p className="text-sm opacity-90">EC2 Instances</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-2xl font-bold">{stats?.s3Count ?? 0}</p>
              <p className="text-sm opacity-90">S3 Buckets</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-2xl font-bold">{stats?.rdsCount ?? 0}</p>
              <p className="text-sm opacity-90">RDS Databases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mx-6 mt-4 bg-white dark:bg-gray-800 rounded-t-lg border border-b-0 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1 px-4">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => handleTabChange('overview')}
            label="Overview"
            icon={<Cloud className="w-4 h-4" />}
            data-cy="tab-overview" data-testid="tab-overview"
          />
          {result && (
            <>
              <TabButton
                active={activeTab === 'ec2'}
                onClick={() => handleTabChange('ec2')}
                label={`EC2 (${stats?.ec2Count || 0})`}
                icon={<Server className="w-4 h-4" />}
                data-cy="tab-ec2" data-testid="tab-ec2"
              />
              <TabButton
                active={activeTab === 's3'}
                onClick={() => handleTabChange('s3')}
                label={`S3 (${stats?.s3Count || 0})`}
                icon={<Database className="w-4 h-4" />}
                data-cy="tab-s3" data-testid="tab-s3"
              />
              <TabButton
                active={activeTab === 'rds'}
                onClick={() => handleTabChange('rds')}
                label={`RDS (${stats?.rdsCount || 0})`}
                icon={<Database className="w-4 h-4" />}
                data-cy="tab-rds" data-testid="tab-rds"
              />
            </>
          )}
          <TabButton
            active={activeTab === 'logs'}
            onClick={() => handleTabChange('logs')}
            label="Execution Log"
            icon={<FileText className="w-4 h-4" />}
            data-cy="tab-logs" data-testid="tab-logs"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="mx-6 flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-800 rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-700 mb-6">
        {result && activeTab !== 'overview' && activeTab !== 'logs' && (
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <Input
                  value={filter.searchText}
                  onChange={(e) => setFilter({ ...filter, searchText: e.target.value })}
                  placeholder={`Search ${activeTab}...`}
                  data-cy="search-input" data-testid="search-input"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {activeTab === 'logs' ? (
            /* Execution Log Tab */
            <div className="min-h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {logs.length} log entries
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearLogs}
                  disabled={logs.length === 0}
                >
                  Clear Logs
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-gray-900 font-mono text-sm">
                {logs.length === 0 ? (
                  <p className="text-gray-500">No execution logs yet. Start a discovery to see logs.</p>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className={`py-1 ${
                        log.level === 'error' ? 'text-red-400' :
                        log.level === 'warning' ? 'text-yellow-400' :
                        'text-gray-300'
                      }`}
                    >
                      <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                      {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : result ? (
            activeTab === 'overview' ? (
              <div className="min-h-full flex flex-col overflow-auto">
                <OverviewTab result={result} />
                <div className="p-4">
                  <ViewDiscoveredDataButton
                    moduleId="aws"
                    recordCount={stats?.totalResources || 0}
                    disabled={!result}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full p-4 flex flex-col">
                <div className="flex-1">
                  <VirtualizedDataGrid
                    data={filteredData}
                    columns={columns}
                    loading={isDiscovering}
                    enableColumnReorder
                    data-cy={`aws-${activeTab}-grid`}
                  />
                </div>
                <ViewDiscoveredDataButton
                  moduleId="aws"
                  recordCount={stats?.totalResources || 0}
                  disabled={!result}
                />
              </div>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <Cloud className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Discovery Results
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure your AWS credentials and regions, then click "Start Discovery" to begin analyzing your AWS infrastructure.
                </p>
                <Button
                  variant="primary"
                  icon={<Play />}
                  onClick={handleStartDiscovery}
                >
                  Start Discovery
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="AWS Cloud Infrastructure Discovery"
        scriptDescription="Discovering EC2 instances, S3 buckets, RDS databases, and Lambda functions"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? {
          percentage: progress,
          message: `Discovering AWS resources...`
        } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

/**
 * Stat Card Component
 */
interface StatCardProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  color: 'orange' | 'blue' | 'green' | 'purple' | 'gray' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon, color }) => {
  const colorClasses = {
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    gray: 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1.5 rounded ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  );
};

/**
 * Tab Button Component
 */
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  'data-cy'?: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label, icon, 'data-cy': dataCy }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors
      ${active
        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'}
    `}
    data-cy={dataCy}
  >
    {icon}
    <span>{label}</span>
  </button>
);

/**
 * Overview Tab Component
 */
interface OverviewTabProps {
  result: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ result }) => (
  <div className="p-6 space-y-6">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Discovery Summary</h3>
      <div className="space-y-3">
        <SummaryRow label="Discovery ID" value={result.id || 'N/A'} />
        <SummaryRow label="Total Resources" value={result.totalResourcesDiscovered || 0} />
        <SummaryRow label="Regions Scanned" value={result.regionsScanned?.join(', ') || 'N/A'} />
        <SummaryRow label="Discovery Time" value={result.discoveryTime ? new Date(result.discoveryTime).toLocaleString() : 'N/A'} />
        <SummaryRow label="Duration" value={result.duration ? `${result.duration}ms` : 'N/A'} />
      </div>
    </div>

    {result.estimatedMonthlyCost && (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Cost Information</h3>
        <div className="space-y-3">
          <SummaryRow label="Estimated Monthly Cost" value={`$${typeof result?.estimatedMonthlyCost === 'number' ? result.estimatedMonthlyCost.toFixed(2) : '0'}`} />
          <SummaryRow label="Cost by Service" value={result.costByService ? JSON.stringify(result.costByService) : 'N/A'} />
        </div>
      </div>
    )}

    {result.securityFindings && (result?.securityFindings?.length ?? 0) > 0 && (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Security Findings</h3>
        <div className="space-y-2">
          {(Array.isArray(result?.securityFindings) ? result.securityFindings.slice(0, 10) : []).map((finding: any, index: number) => (
            <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-900 dark:text-red-100">{finding.message || finding}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

/**
 * Summary Row Component
 */
interface SummaryRowProps {
  label: string;
  value: React.ReactNode;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}:</span>
    <span className="text-sm text-gray-900 dark:text-gray-100">{value}</span>
  </div>
);

export default AWSCloudInfrastructureDiscoveryView;


