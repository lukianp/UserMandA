import React, { useState } from 'react';
import {
  Smartphone,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Monitor,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Package,
  FileText,
  Shield
} from 'lucide-react';
import { useIntuneDiscoveryLogic } from '../../hooks/useIntuneDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const IntuneDiscoveryView: React.FC = () => {
  const {
    config,
    result,
    isDiscovering,
    progress,
    activeTab,
    filter,
    error,
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
  } = useIntuneDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  // Normalize filter to ensure arrays exist
  const normalizedFilter = {
    selectedPlatforms: Array.isArray(filter?.selectedPlatforms) ? filter.selectedPlatforms : [],
    selectedComplianceStates: Array.isArray(filter?.selectedComplianceStates) ? filter.selectedComplianceStates : [],
    selectedManagementStates: Array.isArray(filter?.selectedManagementStates) ? filter.selectedManagementStates : [],
    searchText: filter?.searchText ?? '',
    showNonCompliantOnly: !!filter?.showNonCompliantOnly,
  };

  // Normalize stats objects for safe iteration
  const devicesByPlatform = stats?.devicesByPlatform && typeof stats.devicesByPlatform === 'object' ? stats.devicesByPlatform : {};
  const devicesByComplianceState = stats?.devicesByComplianceState && typeof stats.devicesByComplianceState === 'object' ? stats.devicesByComplianceState : {};
  const topDeviceModels = Array.isArray(stats?.topDeviceModels) ? stats.topDeviceModels : [];

  // Normalize export payload
  const exportPayload = Array.isArray((result as any)?.data) ? (result as any).data : Array.isArray(result) ? result : [];

  const platforms = ['Windows', 'iOS', 'Android', 'macOS', 'Linux'];
  const complianceStates = ['compliant', 'noncompliant', 'conflict', 'error', 'inGracePeriod', 'configManager'];
  const managementStates = ['managed', 'managedByExchangeActiveSync', 'unknown'];

  const togglePlatform = (platform: string) => {
    const current = normalizedFilter.selectedPlatforms;
    const updated = current.includes(platform)
      ? current.filter(p => p !== platform)
      : [...current, platform];
    updateFilter({ selectedPlatforms: updated });
  };

  const toggleComplianceState = (state: string) => {
    const current = normalizedFilter.selectedComplianceStates;
    const updated = current.includes(state)
      ? current.filter(s => s !== state)
      : [...current, state];
    updateFilter({ selectedComplianceStates: updated });
  };

  const toggleManagementState = (state: string) => {
    const current = normalizedFilter.selectedManagementStates;
    const updated = current.includes(state)
      ? current.filter(s => s !== state)
      : [...current, state];
    updateFilter({ selectedManagementStates: updated });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="intune-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering Intune resources...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Intune Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover and analyze Intune devices, applications, and policies
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `intune-discovery-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                aria-label="Export as CSV"
                data-cy="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `intune-discovery-${new Date().toISOString().split('T')[0]}.xlsx`)}
                variant="secondary"
                icon={<FileSpreadsheet className="w-4 h-4" />}
                aria-label="Export as Excel"
                data-cy="export-excel-btn"
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
            data-cy="start-discovery-btn"
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
          data-cy="config-toggle"
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
                label="Include Devices"
                checked={config.includeDevices}
                onChange={(checked) => updateConfig({ includeDevices: checked })}
                data-cy="include-devices-checkbox"
              />
              <Checkbox
                label="Include Applications"
                checked={config.includeApplications}
                onChange={(checked) => updateConfig({ includeApplications: checked })}
                data-cy="include-applications-checkbox"
              />
              <Checkbox
                label="Include Configuration Policies"
                checked={config.includeConfigurationPolicies}
                onChange={(checked) => updateConfig({ includeConfigurationPolicies: checked })}
                data-cy="include-config-policies-checkbox"
              />
              <Checkbox
                label="Include Compliance Policies"
                checked={config.includeCompliancePolicies}
                onChange={(checked) => updateConfig({ includeCompliancePolicies: checked })}
                data-cy="include-compliance-policies-checkbox"
              />
              <Checkbox
                label="Include App Protection Policies"
                checked={config.includeAppProtectionPolicies}
                onChange={(checked) => updateConfig({ includeAppProtectionPolicies: checked })}
                data-cy="include-app-protection-checkbox"
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
                data-cy="timeout-input"
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
              <Monitor className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.totalDevices ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Devices</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <ShieldCheck className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.compliantDevices ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Compliant Devices</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <ShieldAlert className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.nonCompliantDevices ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Non-Compliant</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Cpu className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(typeof stats?.complianceRate === 'number' ? stats.complianceRate : 0).toFixed(1)}%</div>
                <div className="text-sm opacity-90">Compliance Rate</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Package className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.totalApplications ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Applications</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <FileText className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.totalConfigPolicies ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Config Policies</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.totalCompliancePolicies ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Compliance Policies</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <ShieldCheck className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.totalAppProtectionPolicies ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">App Protection</div>
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
            data-cy="tab-overview"
          >
            <Monitor className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'devices'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-devices"
          >
            <Smartphone className="w-4 h-4" />
            Devices
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalDevices ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'applications'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-applications"
          >
            <Package className="w-4 h-4" />
            Applications
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalApplications ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('config-policies')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'config-policies'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-config-policies"
          >
            <FileText className="w-4 h-4" />
            Config Policies
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalConfigPolicies ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('compliance-policies')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'compliance-policies'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-compliance-policies"
          >
            <Shield className="w-4 h-4" />
            Compliance
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalCompliancePolicies ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('app-protection')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'app-protection'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-app-protection"
          >
            <ShieldCheck className="w-4 h-4" />
            App Protection
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalAppProtectionPolicies ?? 0}</span>}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || (stats?.totalDevices ?? 0) === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Intune Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view device statistics and insights.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && (stats?.totalDevices ?? 0) > 0 && (
          <div className="space-y-6 overflow-auto">
            {/* Devices by Platform */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Devices by Platform</h3>
              <div className="space-y-3">
                {Object.entries(devicesByPlatform).map(([platform, count]) => (
                  <div key={platform} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">{platform}</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                        style={{ width: `${(stats?.totalDevices ?? 0) > 0 ? (count / (stats?.totalDevices ?? 0)) * 100 : 0}%` }}
                      >
                        {count > 0 && `${count}`}
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                      {(stats?.totalDevices ?? 0) > 0 ? ((count / (stats?.totalDevices ?? 0)) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance State Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance State Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(devicesByComplianceState).map(([state, count]) => (
                  <div key={state} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{state}</span>
                    <span className={`text-lg font-bold ${state === 'compliant' ? 'text-green-600' : state === 'noncompliant' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Device Models */}
            {topDeviceModels.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Device Models</h3>
                <div className="space-y-2">
                  {topDeviceModels.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.model}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{item.count} devices</span>
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
                  // Debounce search updates to avoid excessive filtering
                  const timeoutId = setTimeout(() => {
                    updateFilter({ searchText: value });
                  }, 150);
                  return () => clearTimeout(timeoutId);
                }}
                placeholder="Search..."
                data-cy="search-input"
              />

              {activeTab === 'devices' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Platform</label>
                    <div className="flex flex-wrap gap-2">
                      {platforms.map(platform => (
                        <button
                          key={platform}
                          onClick={() => togglePlatform(platform)}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            filter.selectedPlatforms.includes(platform)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                          data-cy={`filter-platform-${platform.toLowerCase()}`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Compliance State</label>
                    <div className="flex flex-wrap gap-2">
                      {complianceStates.map(state => (
                        <button
                          key={state}
                          onClick={() => toggleComplianceState(state)}
                          className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                            filter.selectedComplianceStates.includes(state)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                          data-cy={`filter-compliance-${state}`}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Management State</label>
                    <div className="flex flex-wrap gap-2">
                      {managementStates.map(state => (
                        <button
                          key={state}
                          onClick={() => toggleManagementState(state)}
                          className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                            normalizedFilter.selectedManagementStates.includes(state)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                          data-cy={`filter-management-${state}`}
                        >
                          {state === 'managedByExchangeActiveSync' ? 'Exchange ActiveSync' : state}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Checkbox
                    label="Show Non-Compliant Devices Only"
                    checked={normalizedFilter.showNonCompliantOnly}
                    onChange={(checked) => updateFilter({ showNonCompliantOnly: checked })}
                    data-cy="show-noncompliant-checkbox"
                  />
                </div>
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
    </div>
  );
};

export default IntuneDiscoveryView;
