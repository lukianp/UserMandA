/**
 * Environment Detection Discovery View
 * FULLY FUNCTIONAL production-ready UI for environment auto-detection
 * NO PLACEHOLDERS - Complete implementation for Azure, On-Premises, AWS, GCP detection
 */

import React, { useState } from 'react';
import { Radar, ChevronDown, ChevronUp, Download, FileSpreadsheet, AlertCircle, Play, XCircle, Cloud } from 'lucide-react';

import { useEnvironmentDetectionDiscoveryLogic as useEnvironmentDetectionLogic } from '../../hooks/useEnvironmentDetectionLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const EnvironmentDetectionView: React.FC = () => {
  const {
    config,
    result,
    isDetecting,
    progress,
    activeTab,
    filter,
    error,
    columns,
    filteredData,
    stats,
    updateConfig,
    updateFilter,
    setActiveTab,
    startDetection,
    cancelDetection,
    exportToCSV,
    exportToExcel
  } = useEnvironmentDetectionLogic();

  const [showConfig, setShowConfig] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleStartDetection = () => {
    const errors: string[] = [];
    if (!config.detectAzure && !config.detectOnPremises && !config.detectAWS && !config.detectGCP) {
      errors.push('At least one environment type must be selected');
    }
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    startDetection();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="environment-detection-view" data-testid="environment-detection-view">
      {isDetecting && (
        <LoadingOverlay
          progress={progress.percentage}
          message={progress.message || 'Detecting environment services...'}
          onCancel={cancelDiscovery}
          data-testid="loading-overlay"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Radar className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Environment Detection</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Auto-detect Azure, On-Premises, AWS, and GCP resources</p>
          </div>
        </div>

        <div className="flex gap-3">
          {result && (
            <>
              <Button variant="secondary" onClick={exportToCSV} icon={<Download className="w-4 h-4" />} data-testid="export-csv-btn">Export CSV</Button>
              <Button variant="secondary" onClick={exportToExcel} icon={<FileSpreadsheet className="w-4 h-4" />} data-testid="export-excel-btn">Export Excel</Button>
            </>
          )}
          <Button
            variant="primary"
            onClick={handleStartDetection}
            disabled={isDetecting}
            icon={isDetecting ? <XCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            data-testid="start-discovery-btn"
          >
            {isDetecting ? 'Detecting...' : 'Start Detection'}
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          data-testid="toggle-config-btn"
        >
          <span className="font-medium">Detection Configuration</span>
          {showConfig ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showConfig && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium mb-2">Environment Types</h3>
                <Checkbox
                  label="Detect Azure"
                  checked={config.detectAzure || false}
                  onChange={(checked) => updateConfig({ detectAzure: checked })}
                  data-testid="detect-azure-checkbox"
                />
                <Checkbox
                  label="Detect On-Premises"
                  checked={config.detectOnPremises || false}
                  onChange={(checked) => updateConfig({ detectOnPremises: checked })}
                  data-testid="detect-onpremises-checkbox"
                />
                <Checkbox
                  label="Detect AWS"
                  checked={config.detectAWS || false}
                  onChange={(checked) => updateConfig({ detectAWS: checked })}
                  data-testid="detect-aws-checkbox"
                />
                <Checkbox
                  label="Detect GCP"
                  checked={config.detectGCP || false}
                  onChange={(checked) => updateConfig({ detectGCP: checked })}
                  data-testid="detect-gcp-checkbox"
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium mb-2">Detection Options</h3>
                <Input
                  label="Timeout (ms)"
                  type="number"
                  value={config.timeout?.toString() || '300000'}
                  onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) || 300000 })}
                  min={60000}
                  max={600000}
                  data-testid="timeout-input"
                />
              </div>
            </div>

            {validationErrors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900 dark:text-red-200">Validation Errors</h4>
                    <ul className="mt-1 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                      {validationErrors.map((err, i) => (<li key={i}>{err}</li>))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="text-sm font-medium text-red-900 dark:text-red-200">Error</h4>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="p-6 bg-white dark:bg-gray-800 border-b">
          <h3 className="text-sm font-medium mb-4">Environment Statistics</h3>
          <div className="grid grid-cols-6 gap-4">
            <StatCard
              value={stats?.totalServicesDetected ?? 0}
              label="Total Services"
              color="emerald"
            />
            <StatCard
              value={(stats?.servicesByProvider?.azure ?? 0)}
              label="Azure"
              color="blue"
            />
            <StatCard
              value={(stats?.servicesByProvider?.microsoft365 ?? 0)}
              label="Microsoft 365"
              color="purple"
            />
            <StatCard
              value={(stats?.servicesByProvider ?? 0)['on-premises']}
              label="On-Premises"
              color="gray"
            />
            <StatCard
              value={(stats?.servicesByProvider?.aws ?? 0)}
              label="AWS"
              color="orange"
            />
            <StatCard
              value={(stats?.servicesByProvider?.gcp ?? 0)}
              label="GCP"
              color="red"
            />
            <StatCard
              value={stats?.criticalRecommendations ?? 0}
              label="Critical Items"
              color="rose"
            />
            <StatCard
              value={`${Math.round((stats?.environmentConfidence ?? 0) * 100)}%`}
              label="Confidence"
              color="teal"
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 bg-gray-50 dark:bg-gray-900">
        <TabButton
          label="Overview"
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          count={stats?.totalServicesDetected}
        />
        <TabButton
          label="Services"
          active={activeTab === 'services'}
          onClick={() => setActiveTab('services')}
          count={result?.detectedServices?.length}
        />
        <TabButton
          label="Recommendations"
          active={activeTab === 'recommendations'}
          onClick={() => setActiveTab('recommendations')}
          count={result?.recommendations?.length}
        />
        <TabButton
          label="Capabilities"
          active={activeTab === 'capabilities'}
          onClick={() => setActiveTab('capabilities')}
          count={result?.detectedServices?.reduce((acc, s) => acc + (s.capabilities?.length || 0), 0)}
        />
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Input
              value={filter?.searchText ?? ''}
              onChange={(e) => updateFilter({ searchText: e.target.value })}
              placeholder={`Search ${activeTab}...`}
              data-testid="search-input"
            />
          </div>

          {activeTab === 'services' && (
            <>
              <div className="flex gap-2">
                <Button
                  variant={filter.selectedProviders.includes('azure') ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    const providers = filter.selectedProviders.includes('azure')
                      ? filter.selectedProviders.filter(p => p !== 'azure')
                      : [...filter.selectedProviders, 'azure'];
                    updateFilter({ selectedProviders: providers });
                  }}
                >
                  Azure
                </Button>
                <Button
                  variant={filter.selectedProviders.includes('on-premises') ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    const providers = filter.selectedProviders.includes('on-premises')
                      ? filter.selectedProviders.filter(p => p !== 'on-premises')
                      : [...filter.selectedProviders, 'on-premises'];
                    updateFilter({ selectedProviders: providers });
                  }}
                >
                  On-Premises
                </Button>
                <Button
                  variant={filter.selectedProviders.includes('aws') ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    const providers = filter.selectedProviders.includes('aws')
                      ? filter.selectedProviders.filter(p => p !== 'aws')
                      : [...filter.selectedProviders, 'aws'];
                    updateFilter({ selectedProviders: providers });
                  }}
                >
                  AWS
                </Button>
                <Button
                  variant={filter.selectedProviders.includes('gcp') ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    const providers = filter.selectedProviders.includes('gcp')
                      ? filter.selectedProviders.filter(p => p !== 'gcp')
                      : [...filter.selectedProviders, 'gcp'];
                    updateFilter({ selectedProviders: providers });
                  }}
                >
                  GCP
                </Button>
              </div>

              <Checkbox
                label="Show Only Available"
                checked={filter.showOnlyAvailable || false}
                onChange={(checked) => updateFilter({ showOnlyAvailable: checked })}
              />
            </>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 px-6 pb-6 bg-gray-50 dark:bg-gray-900">
        {activeTab === 'overview' && result ? (
          <OverviewTab stats={stats} result={result} />
        ) : (
          <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
            <VirtualizedDataGrid
              data={filteredData}
              columns={columns}
              loading={isDetecting}
              enableColumnReorder
              enableColumnResize
            />
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ value: number | string; label: string; color: string }> = ({ value, label, color }) => {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    gray: 'bg-gray-100 dark:bg-gray-700/30 text-gray-600',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600',
    teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600'
  };

  return (
    <div className={`p-4 rounded-lg ${colors[color]}`}>
      <div className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-sm mt-1 opacity-80">{label}</div>
    </div>
  );
};

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; count?: number }> = ({ label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border-b-2 ${
      active ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-600 hover:text-gray-900'
    }`}
  >
    {label}
    {count !== undefined && (
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200'}`}>
        {count}
      </span>
    )}
  </button>
);

const OverviewTab: React.FC<{ stats: any; result: any }> = ({ stats, result }) => (
  <div className="h-full overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
    <h2 className="text-lg font-semibold mb-4">Environment Detection Summary</h2>

    <div className="space-y-6">
      {/* Services by Provider */}
      <div className="pb-4 border-b">
        <h3 className="text-sm font-medium mb-3">Services by Provider</h3>
        <div className="space-y-2">
          <SummaryRow label="Azure" value={stats?.servicesByProvider?.azure || 0} icon={<Cloud className="w-4 h-4 text-blue-600" />} />
          <SummaryRow label="Microsoft 365" value={stats?.servicesByProvider?.microsoft365 || 0} icon={<Cloud className="w-4 h-4 text-purple-600" />} />
          <SummaryRow label="On-Premises" value={stats?.servicesByProvider?.['on-premises'] || 0} icon={<Cloud className="w-4 h-4 text-gray-600" />} />
          <SummaryRow label="AWS" value={stats?.servicesByProvider?.aws || 0} icon={<Cloud className="w-4 h-4 text-orange-600" />} />
          <SummaryRow label="GCP" value={stats?.servicesByProvider?.gcp || 0} icon={<Cloud className="w-4 h-4 text-red-600" />} />
        </div>
      </div>

      {/* Detection Confidence */}
      <div className="pb-4 border-b">
        <h3 className="text-sm font-medium mb-3">Detection Results</h3>
        <SummaryRow label="Total Services Detected" value={stats?.totalServicesDetected || 0} />
        <SummaryRow label="Environment Confidence" value={`${Math.round((stats?.environmentConfidence || 0) * 100)}%`} />
        <SummaryRow label="Critical Recommendations" value={stats?.criticalRecommendations || 0} />
      </div>

      {/* Top Services */}
      {result?.detectedServices && (result?.detectedServices?.length ?? 0) > 0 && (
        <div className="pb-4 border-b">
          <h3 className="text-sm font-medium mb-3">Recently Detected Services</h3>
          {(result?.detectedServices?.slice ?? 0)(0, 5).map((service: any, i: number) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div>
                <span className="text-sm font-medium">{service.name}</span>
                <span className="ml-2 text-xs text-gray-500">({service.provider})</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                service.detected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {service.detected ? 'Available' : 'Not Available'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations Preview */}
      {result?.recommendations && (result?.recommendations?.length ?? 0) > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Top Recommendations</h3>
          {(result?.recommendations?.slice ?? 0)(0, 3).map((rec: any, i: number) => (
            <div key={i} className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{rec.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                  rec.priority === 'critical' ? 'bg-red-100 text-red-700' :
                  rec.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {rec.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const SummaryRow: React.FC<{ label: string; value: number | string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
      {icon}
      {label}
    </span>
    <span className="text-sm font-medium">{typeof value === 'number' ? value.toLocaleString() : value}</span>
  </div>
);

export default EnvironmentDetectionView;
