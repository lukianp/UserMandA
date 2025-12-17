import { useState } from 'react';
import {
  Shield,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Key,
  Users,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';

import { useEntraIDAppDiscoveryLogic } from '../../hooks/useEntraIDAppDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const EntraIDAppDiscoveryView: React.FC = () => {
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
  } = useEntraIDAppDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  // Normalize filter to ensure arrays exist
  const normalizedFilter = {
    selectedAppTypes: Array.isArray(filter?.selectedAppTypes) ? filter.selectedAppTypes : [],
    selectedPermissionTypes: Array.isArray(filter?.selectedPermissionTypes) ? filter.selectedPermissionTypes : [],
    searchText: filter?.searchText ?? '',
    showExpiringSecretsOnly: !!filter?.showExpiringSecretsOnly,
    showHighRiskOnly: !!filter?.showHighRiskOnly,
  };

  // Normalize stats objects for safe iteration
  const appsByType = stats?.appsByType && typeof stats.appsByType === 'object' ? stats.appsByType : {};
  const permissionsByType = stats?.permissionsByType && typeof stats.permissionsByType === 'object' ? stats.permissionsByType : {};
  const topPermissions = Array.isArray(stats?.topPermissions) ? stats.topPermissions : [];

  // Normalize export payload
  const exportPayload = Array.isArray((result as any)?.data) ? (result as any).data : Array.isArray(result) ? result : [];

  const appTypes = ['WebApp', 'NativeApp', 'ServicePrincipal', 'ManagedIdentity'];
  const permissionTypes = ['Delegated', 'Application', 'Admin'];

  const toggleAppType = (type: string) => {
    const current = normalizedFilter.selectedAppTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    updateFilter({ selectedAppTypes: updated });
  };

  const togglePermissionType = (type: string) => {
    const current = normalizedFilter.selectedPermissionTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    updateFilter({ selectedPermissionTypes: updated });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="entraid-app-discovery-view" data-testid="entraid-app-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering Entra ID applications...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Entra ID Application Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover application registrations, permissions, and secrets to assess security posture and identify compliance risks
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `entraid-app-discovery-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                aria-label="Export as CSV"
                data-cy="export-csv-btn" data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `entraid-app-discovery-${new Date().toISOString().split('T')[0]}.xlsx`)}
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
                label="Include App Registrations"
                checked={config.includeAppRegistrations}
                onChange={(checked) => updateConfig({ includeAppRegistrations: checked })}
                data-cy="include-apps-checkbox" data-testid="include-apps-checkbox"
              />
              <Checkbox
                label="Include Service Principals"
                checked={config.includeServicePrincipals}
                onChange={(checked) => updateConfig({ includeServicePrincipals: checked })}
                data-cy="include-sp-checkbox" data-testid="include-sp-checkbox"
              />
              <Checkbox
                label="Include Permissions"
                checked={config.includePermissions}
                onChange={(checked) => updateConfig({ includePermissions: checked })}
                data-cy="include-permissions-checkbox" data-testid="include-permissions-checkbox"
              />
              <Checkbox
                label="Include Secrets & Certificates"
                checked={config.includeSecrets}
                onChange={(checked) => updateConfig({ includeSecrets: checked })}
                data-cy="include-secrets-checkbox" data-testid="include-secrets-checkbox"
              />
              <Checkbox
                label="Analyze Secret Expiration"
                checked={config.analyzeSecretExpiration}
                onChange={(checked) => updateConfig({ analyzeSecretExpiration: checked })}
                data-cy="analyze-expiration-checkbox" data-testid="analyze-expiration-checkbox"
              />
              <Checkbox
                label="Include Managed Identities"
                checked={config.includeManagedIdentities}
                onChange={(checked) => updateConfig({ includeManagedIdentities: checked })}
                data-cy="include-managed-checkbox" data-testid="include-managed-checkbox"
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
          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(typeof stats?.totalApplications === 'number' ? stats.totalApplications : 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Applications</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Key className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.appsWithSecrets ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Apps with Secrets</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.expiringSecrets ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Expiring Secrets</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.servicePrincipals ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Service Principals</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Lock className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.delegatedPermissions ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Delegated Permissions</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.applicationPermissions ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">App Permissions</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.managedIdentities ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Managed Identities</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Clock className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{((stats?.expiredSecrets ?? 0) ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Expired Secrets</div>
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
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'applications'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-applications" data-testid="tab-applications"
          >
            <FileText className="w-4 h-4" />
            Applications
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalApplications ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('service-principals')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'service-principals'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-service-principals" data-testid="tab-service-principals"
          >
            <CheckCircle className="w-4 h-4" />
            Service Principals
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.servicePrincipals ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'permissions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-permissions" data-testid="tab-permissions"
          >
            <Lock className="w-4 h-4" />
            Permissions
          </button>
          <button
            onClick={() => setActiveTab('secrets')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'secrets'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-secrets" data-testid="tab-secrets"
          >
            <Key className="w-4 h-4" />
            Secrets & Certificates
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.appsWithSecrets ?? 0}</span>}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || (stats?.totalApplications ?? 0) === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Application Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view Entra ID application statistics and insights.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && (stats?.totalApplications ?? 0) > 0 && (
          <div className="space-y-6 overflow-auto">
            {/* Applications by Type */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Applications by Type</h3>
              <div className="space-y-3">
                {Object.entries(appsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">{type}</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-purple-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                        style={{ width: `${(stats?.totalApplications ?? 0) > 0 ? (count / (stats?.totalApplications ?? 0)) * 100 : 0}%` }}
                      >
                        {count > 0 && `${count}`}
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                      {(stats?.totalApplications ?? 0) > 0 ? ((count / (stats?.totalApplications ?? 0)) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Permissions by Type */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Permissions Distribution</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(permissionsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                    <span className="text-lg font-bold text-purple-600">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Permissions */}
            {topPermissions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Used Permissions</h3>
                <div className="space-y-2">
                  {topPermissions.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.permission}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{item.count} apps</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Secret Expiration Warning */}
            {((stats?.expiringSecrets ?? 0) > 0 || (stats?.expiredSecrets ?? 0) > 0) && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Secret Expiration Alert</h3>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                      {stats?.expiredSecrets ?? 0} secrets have expired and {stats?.expiringSecrets ?? 0} will expire within 30 days.
                      Immediate action required to prevent service disruptions.
                    </p>
                    <Button variant="secondary" size="sm" onClick={() => setActiveTab('secrets')}>
                      View Secrets
                    </Button>
                  </div>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Application Type</label>
                  <div className="flex flex-wrap gap-2">
                    {appTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => toggleAppType(type)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          normalizedFilter.selectedAppTypes.includes(type)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        data-cy={`filter-app-type-${type.toLowerCase()}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab === 'permissions' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Permission Type</label>
                    <div className="flex flex-wrap gap-2">
                      {permissionTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => togglePermissionType(type)}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            normalizedFilter.selectedPermissionTypes.includes(type)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                          data-cy={`filter-permission-${type.toLowerCase()}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'secrets' && (
                  <Checkbox
                    label="Show Expiring Secrets Only (<30 days)"
                    checked={normalizedFilter.showExpiringSecretsOnly}
                    onChange={(checked) => updateFilter({ showExpiringSecretsOnly: checked })}
                    data-cy="show-expiring-checkbox" data-testid="show-expiring-checkbox"
                  />
                )}

                <Checkbox
                  label="Show High-Risk Applications Only"
                  checked={normalizedFilter.showHighRiskOnly}
                  onChange={(checked) => updateFilter({ showHighRiskOnly: checked })}
                  data-cy="show-high-risk-checkbox" data-testid="show-high-risk-checkbox"
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
        scriptName="Entra ID App Discovery"
        scriptDescription="Discovering application registrations, permissions, and security configuration"
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

export default EntraIDAppDiscoveryView;
