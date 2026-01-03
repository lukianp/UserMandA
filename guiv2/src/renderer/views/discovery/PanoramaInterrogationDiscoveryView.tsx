/**
 * Panorama Interrogation Discovery View
 * UI for interrogating Palo Alto Panorama firewall configurations
 */

import { useState } from 'react';
import {
  Shield,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Server,
  Lock,
  Globe,
  Layers,
  Activity,
  AlertTriangle
} from 'lucide-react';

import { usePanoramaInterrogationDiscoveryLogic } from '../../hooks/usePanoramaInterrogationDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
import { ViewDiscoveredDataButton } from '../../components/molecules/ViewDiscoveredDataButton';

const PanoramaInterrogationDiscoveryView: React.FC = () => {
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
  } = usePanoramaInterrogationDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState({
    searchText: '',
    selectedDeviceGroups: [],
    showEnabledOnly: false,
  });

  // Normalize filter
  const normalizedFilter = {
    searchText: filter?.searchText ?? '',
    selectedDeviceGroups: Array.isArray(filter?.selectedDeviceGroups) ? filter.selectedDeviceGroups : [],
    showEnabledOnly: !!filter?.showEnabledOnly,
  };

  // Stub implementations for missing functionality
  const columns: any[] = [];
  const filteredData: any[] = [];
  const stats = result ? {
    totalSecurityPolicies: result.totalSecurityPolicies || 0,
    totalNATRules: result.totalNATRules || 0,
    totalAddressObjects: result.totalAddressObjects || 0,
    totalDeviceGroups: result.totalDeviceGroups || 0,
  } : null;

  const exportToCSV = () => {
    console.log('[PanoramaView] CSV export not implemented');
  };

  const exportToExcel = () => {
    console.log('[PanoramaView] Excel export not implemented');
  };

  const updateFilter = (updates: any) => {
    setFilter((prev: any) => ({ ...prev, ...updates }));
  };

  // Normalize export payload
  const exportPayload = Array.isArray((result as any)?.data) ? (result as any).data : Array.isArray(result) ? result : [];

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="panorama-interrogation-discovery-view" data-testid="panorama-interrogation-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Interrogating Panorama configurations...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panorama Interrogation</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Interrogate Palo Alto Panorama firewall configurations to assess security posture and migration requirements
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Panorama Hostname/IP
                </label>
                <Input
                  type="text"
                  value={config.panoramaHost}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    updateConfig({ panoramaHost: e.target.value });
                  }}
                  placeholder="panorama.example.com"
                  data-cy="panorama-host-input" data-testid="panorama-host-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Port
                </label>
                <Input
                  type="number"
                  value={config.apiPort}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    updateConfig({ apiPort: parseInt(e.target.value) || 443 });
                  }}
                  min={1}
                  max={65535}
                  data-cy="api-port-input" data-testid="api-port-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Checkbox
                label="Include Security Policies"
                checked={config.includeSecurityPolicies}
                onChange={(checked) => updateConfig({ includeSecurityPolicies: checked })}
                data-cy="include-security-policies-checkbox" data-testid="include-security-policies-checkbox"
              />
              <Checkbox
                label="Include NAT Rules"
                checked={config.includeNATRules}
                onChange={(checked) => updateConfig({ includeNATRules: checked })}
                data-cy="include-nat-rules-checkbox" data-testid="include-nat-rules-checkbox"
              />
              <Checkbox
                label="Include Address/Service Objects"
                checked={config.includeObjects}
                onChange={(checked) => updateConfig({ includeObjects: checked })}
                data-cy="include-objects-checkbox" data-testid="include-objects-checkbox"
              />
              <Checkbox
                label="Include Device Groups"
                checked={config.includeDeviceGroups}
                onChange={(checked) => updateConfig({ includeDeviceGroups: checked })}
                data-cy="include-device-groups-checkbox" data-testid="include-device-groups-checkbox"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Port
              </label>
              <Input
                type="number"
                value={config.apiPort}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const next = Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : config.apiPort;
                  updateConfig({ apiPort: next });
                }}
                min={1}
                max={65535}
                data-cy="api-port-input" data-testid="api-port-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalSecurityPolicies ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Security Policies</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalNATRules ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">NAT Rules</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Lock className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalAddressObjects ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Address Objects</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Server className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalDeviceGroups ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Device Groups</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Layers className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats as any)?.totalServiceObjects ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Service Objects</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Activity className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats as any)?.managedDevices ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Managed Devices</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats as any)?.totalZones ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Security Zones</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats as any)?.unusedRules ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Unused Rules</div>
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
            <Shield className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('security-policies')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'security-policies'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-security-policies" data-testid="tab-security-policies"
          >
            <Shield className="w-4 h-4" />
            Security Policies
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalSecurityPolicies ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('nat-rules')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'nat-rules'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-nat-rules" data-testid="tab-nat-rules"
          >
            <Globe className="w-4 h-4" />
            NAT Rules
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalNATRules ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('device-groups')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'device-groups'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-device-groups" data-testid="tab-device-groups"
          >
            <Server className="w-4 h-4" />
            Device Groups
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalDeviceGroups ?? 0}</span>}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || (stats?.totalSecurityPolicies ?? 0) === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Panorama Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Configure connection and start discovery to view firewall configuration insights.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && (stats?.totalSecurityPolicies ?? 0) > 0 && (
          <div className="space-y-6 overflow-auto">
            {/* Security Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Policies</span>
                  <span className="text-lg font-bold text-blue-600">{(stats?.totalSecurityPolicies ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Rules</span>
                  <span className="text-lg font-bold text-green-600">{((stats?.totalSecurityPolicies ?? 0) - ((stats as any)?.unusedRules ?? 0)).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Security Zones</span>
                  <span className="text-lg font-bold text-purple-600">{((stats as any)?.totalZones ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <>
            {/* Filters */}
            <div className="mb-4 space-y-4">
              <Input
                value={normalizedFilter.searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateFilter({ searchText: e.target.value });
                }}
                placeholder="Search..."
                data-cy="search-input" data-testid="search-input"
              />

              {activeTab === 'security-policies' && (
                <Checkbox
                  label="Show Enabled Policies Only"
                  checked={normalizedFilter.showEnabledOnly}
                  onChange={(checked) => updateFilter({ showEnabledOnly: checked })}
                  data-cy="show-enabled-only-checkbox" data-testid="show-enabled-only-checkbox"
                />
              )}
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

      <div className="px-6 pb-6">
        <ViewDiscoveredDataButton
          moduleId="panorama-interrogation"
          recordCount={stats?.totalSecurityPolicies || 0}
          disabled={!result || (stats?.totalSecurityPolicies || 0) === 0}
        />
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Panorama Interrogation"
        scriptDescription="Interrogating Palo Alto Panorama firewall configurations"
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

export default PanoramaInterrogationDiscoveryView;


