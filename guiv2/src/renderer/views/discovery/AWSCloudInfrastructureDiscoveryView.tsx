/**
 * AWS Cloud Infrastructure Discovery View
 * Production-grade UI for discovering and analyzing AWS resources across multiple regions
 */

import React, { useState } from 'react';
import {
  Cloud, Server, Database, Settings, Download, Play, Square,
  ChevronDown, ChevronUp, AlertTriangle, DollarSign, Shield
} from 'lucide-react';
import { useAWSDiscoveryLogic } from '../../hooks/useAWSDiscoveryLogic';
import VirtualizedDataGrid from '../../components/organisms/VirtualizedDataGrid';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Select from '../../components/atoms/Select';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import ProgressBar from '../../components/molecules/ProgressBar';

/**
 * AWS Cloud Infrastructure Discovery View Component
 */
const AWSCloudInfrastructureDiscoveryView: React.FC = () => {
  const {
    config,
    setConfig,
    result,
    isDiscovering,
    progress,
    error,
    filter,
    setFilter,
    startDiscovery,
    cancelDiscovery,
    exportToCSV,
    exportToExcel,
    activeTab,
    setActiveTab,
    columns,
    filteredData,
    stats
  } = useAWSDiscoveryLogic();

  // Local UI state
  const [showConfig, setShowConfig] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  /**
   * Validate configuration before starting discovery
   */
  const handleStartDiscovery = () => {
    const errors: string[] = [];

    if (!config.accessKeyId || config.accessKeyId.trim() === '') {
      errors.push('AWS Access Key ID is required');
    }

    if (!config.secretAccessKey || config.secretAccessKey.trim() === '') {
      errors.push('AWS Secret Access Key is required');
    }

    if (!config.awsRegions || config.awsRegions.length === 0) {
      errors.push('At least one AWS region must be selected');
    }

    if (!config.resourceTypes || config.resourceTypes.length === 0) {
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
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="aws-cloud-infrastructure-discovery-view">
      {/* Loading Overlay */}
      {isDiscovering && (
        <LoadingOverlay
          progress={progress}
          onCancel={cancelDiscovery}
          message="Discovering AWS resources..."
        />
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Cloud className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                AWS Cloud Infrastructure Discovery
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover and analyze AWS resources across regions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {result && (
              <>
                <Button
                  variant="secondary"
                  icon={<Download />}
                  onClick={exportToCSV}
                  disabled={isDiscovering}
                  data-cy="export-csv-btn"
                >
                  Export CSV
                </Button>
                <Button
                  variant="secondary"
                  icon={<Download />}
                  onClick={exportToExcel}
                  disabled={isDiscovering}
                  data-cy="export-excel-btn"
                >
                  Export Excel
                </Button>
              </>
            )}
            {!isDiscovering ? (
              <Button
                variant="primary"
                icon={<Play />}
                onClick={handleStartDiscovery}
                data-cy="start-discovery-btn"
              >
                Start Discovery
              </Button>
            ) : (
              <Button
                variant="danger"
                icon={<Square />}
                onClick={cancelDiscovery}
                data-cy="cancel-discovery-btn"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isDiscovering && progress > 0 && (
          <div className="px-4 pb-4">
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
          <div className="px-4 pb-4">
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
      </div>

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          data-cy="config-toggle"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">Configuration</span>
          </div>
          {showConfig ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
                  data-cy="access-key-input"
                />
                <Input
                  label="Secret Access Key"
                  type="password"
                  value={config.secretAccessKey || ''}
                  onChange={(e) => setConfig({ secretAccessKey: e.target.value })}
                  placeholder="Enter secret key"
                  required
                  disabled={isDiscovering}
                  data-cy="secret-key-input"
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
                    data-cy="resource-ec2"
                  />
                  <Checkbox
                    label="S3 Buckets"
                    checked={config.resourceTypes?.includes('s3') || false}
                    onChange={() => toggleResourceType('s3')}
                    disabled={isDiscovering}
                    data-cy="resource-s3"
                  />
                  <Checkbox
                    label="RDS Databases"
                    checked={config.resourceTypes?.includes('rds') || false}
                    onChange={() => toggleResourceType('rds')}
                    disabled={isDiscovering}
                    data-cy="resource-rds"
                  />
                  <Checkbox
                    label="Lambda Functions"
                    checked={config.resourceTypes?.includes('lambda') || false}
                    onChange={() => toggleResourceType('lambda')}
                    disabled={isDiscovering}
                    data-cy="resource-lambda"
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
                    onChange={(e) => setConfig({ includeTagDetails: e.target.checked })}
                    disabled={isDiscovering}
                    data-cy="option-tags"
                  />
                  <Checkbox
                    label="Include Cost Estimates"
                    checked={config.includeCostEstimates || false}
                    onChange={(e) => setConfig({ includeCostEstimates: e.target.checked })}
                    disabled={isDiscovering}
                    data-cy="option-costs"
                  />
                  <Checkbox
                    label="Include Security Analysis"
                    checked={config.includeSecurityAnalysis || false}
                    onChange={(e) => setConfig({ includeSecurityAnalysis: e.target.checked })}
                    disabled={isDiscovering}
                    data-cy="option-security"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-6 gap-4">
            <StatCard
              value={stats.totalResources}
              label="Total Resources"
              icon={<Cloud className="w-5 h-5" />}
              color="orange"
            />
            <StatCard
              value={stats.ec2Count}
              label="EC2 Instances"
              icon={<Server className="w-5 h-5" />}
              color="blue"
            />
            <StatCard
              value={stats.s3Count}
              label="S3 Buckets"
              icon={<Database className="w-5 h-5" />}
              color="green"
            />
            <StatCard
              value={stats.rdsCount}
              label="RDS Databases"
              icon={<Database className="w-5 h-5" />}
              color="purple"
            />
            <StatCard
              value={`$${stats.estimatedCost.toFixed(2)}`}
              label="Est. Monthly Cost"
              icon={<DollarSign className="w-5 h-5" />}
              color="gray"
            />
            <StatCard
              value={stats.securityRisks}
              label="Security Risks"
              icon={<Shield className="w-5 h-5" />}
              color={stats.securityRisks > 0 ? "red" : "green"}
            />
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      {result && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 px-4">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              label="Overview"
              icon={<Cloud className="w-4 h-4" />}
              data-cy="tab-overview"
            />
            <TabButton
              active={activeTab === 'ec2'}
              onClick={() => setActiveTab('ec2')}
              label={`EC2 (${stats?.ec2Count || 0})`}
              icon={<Server className="w-4 h-4" />}
              data-cy="tab-ec2"
            />
            <TabButton
              active={activeTab === 's3'}
              onClick={() => setActiveTab('s3')}
              label={`S3 (${stats?.s3Count || 0})`}
              icon={<Database className="w-4 h-4" />}
              data-cy="tab-s3"
            />
            <TabButton
              active={activeTab === 'rds'}
              onClick={() => setActiveTab('rds')}
              label={`RDS (${stats?.rdsCount || 0})`}
              icon={<Database className="w-4 h-4" />}
              data-cy="tab-rds"
            />
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {result && activeTab !== 'overview' && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <Input
                  value={filter.searchText}
                  onChange={(e) => setFilter({ ...filter, searchText: e.target.value })}
                  placeholder={`Search ${activeTab}...`}
                  data-cy="search-input"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
          {result ? (
            activeTab === 'overview' ? (
              <OverviewTab result={result} />
            ) : (
              <div className="h-full p-4">
                <VirtualizedDataGrid
                  data={filteredData}
                  columns={columns}
                  loading={isDiscovering}
                  enableExport
                  enableColumnReorder
                  enableFiltering
                  data-cy={`aws-${activeTab}-grid`}
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
          <SummaryRow label="Estimated Monthly Cost" value={`$${result.estimatedMonthlyCost.toFixed(2)}`} />
          <SummaryRow label="Cost by Service" value={result.costByService ? JSON.stringify(result.costByService) : 'N/A'} />
        </div>
      </div>
    )}

    {result.securityFindings && result.securityFindings.length > 0 && (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Security Findings</h3>
        <div className="space-y-2">
          {result.securityFindings.slice(0, 10).map((finding: any, index: number) => (
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
