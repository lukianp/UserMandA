import { useState } from 'react';
import {
  Users,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Link,
  Shield,
  Globe,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Building
} from 'lucide-react';

import { useExternalIdentityDiscoveryLogic } from '../../hooks/useExternalIdentityDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const ExternalIdentityDiscoveryView: React.FC = () => {
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
  } = useExternalIdentityDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  // Normalize filter
  const normalizedFilter = {
    selectedProviders: Array.isArray(filter?.selectedProviders) ? filter.selectedProviders : [],
    selectedUserTypes: Array.isArray(filter?.selectedUserTypes) ? filter.selectedUserTypes : [],
    searchText: filter?.searchText ?? '',
    showActiveOnly: !!filter?.showActiveOnly,
  };

  // Normalize stats
  const providersByType = stats?.providersByType && typeof stats.providersByType === 'object' ? stats.providersByType : {};
  const usersByProvider = stats?.usersByProvider && typeof stats.usersByProvider === 'object' ? stats.usersByProvider : {};

  const exportPayload = Array.isArray((result as any)?.data) ? (result as any).data : Array.isArray(result) ? result : [];

  const providers = ['SAML', 'OIDC', 'OAuth2', 'WS-Federation', 'ADFS'];
  const userTypes = ['Guest', 'External', 'B2B', 'Partner'];

  const toggleProvider = (provider: string) => {
    const current = normalizedFilter.selectedProviders;
    const updated = current.includes(provider) ? current.filter(p => p !== provider) : [...current, provider];
    updateFilter({ selectedProviders: updated });
  };

  const toggleUserType = (type: string) => {
    const current = normalizedFilter.selectedUserTypes;
    const updated = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
    updateFilter({ selectedUserTypes: updated });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="external-identity-discovery-view" data-testid="external-identity-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering external identities...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">External Identity Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover external identity providers, B2B users, and guest access to assess federated identity security
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `external-identity-discovery-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                aria-label="Export as CSV"
                data-cy="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `external-identity-discovery-${new Date().toISOString().split('T')[0]}.xlsx`)}
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
          {configExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </button>

        {configExpanded && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Checkbox
                label="Include Identity Providers"
                checked={config.includeProviders}
                onChange={(checked) => updateConfig({ includeProviders: checked })}
                data-cy="include-providers-checkbox"
              />
              <Checkbox
                label="Include Guest Users"
                checked={config.includeGuestUsers}
                onChange={(checked) => updateConfig({ includeGuestUsers: checked })}
                data-cy="include-guests-checkbox"
              />
              <Checkbox
                label="Include B2B Connections"
                checked={config.includeB2BConnections}
                onChange={(checked) => updateConfig({ includeB2BConnections: checked })}
                data-cy="include-b2b-checkbox"
              />
              <Checkbox
                label="Analyze Trust Relationships"
                checked={config.analyzeTrustRelationships}
                onChange={(checked) => updateConfig({ analyzeTrustRelationships: checked })}
                data-cy="analyze-trust-checkbox"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timeout (ms)</label>
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
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalProviders ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Identity Providers</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalExternalUsers ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">External Users</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <UserCheck className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.guestUsers ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Guest Users</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Link className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.b2bConnections ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">B2B Connections</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Building className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.partnerOrganizations ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Partner Orgs</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.activeConnections ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Active Connections</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.untrustedProviders ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Untrusted Providers</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.securityScore ?? 0).toFixed(0)}%</div>
                <div className="text-sm opacity-90">Security Score</div>
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
              activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-overview"
          >
            <Globe className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'providers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-providers"
          >
            <Shield className="w-4 h-4" />
            Providers
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalProviders ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-users"
          >
            <Users className="w-4 h-4" />
            External Users
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalExternalUsers ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'connections' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-connections"
          >
            <Link className="w-4 h-4" />
            B2B Connections
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.b2bConnections ?? 0}</span>}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || (stats?.totalProviders ?? 0) === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No External Identity Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view external identity provider statistics.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && (stats?.totalProviders ?? 0) > 0 && (
          <div className="space-y-6 overflow-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Providers by Type</h3>
              <div className="space-y-3">
                {Object.entries(providersByType).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">{type}</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                        style={{ width: `${(stats?.totalProviders ?? 0) > 0 ? (count / (stats?.totalProviders ?? 0)) * 100 : 0}%` }}
                      >
                        {count > 0 && `${count}`}
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                      {(stats?.totalProviders ?? 0) > 0 ? ((count / (stats?.totalProviders ?? 0)) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <>
            <div className="mb-4 space-y-4">
              <Input
                value={normalizedFilter.searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  setTimeout(() => updateFilter({ searchText: value }), 150);
                }}
                placeholder="Search..."
                data-cy="search-input"
              />
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Provider</label>
                  <div className="flex flex-wrap gap-2">
                    {providers.map(provider => (
                      <button
                        key={provider}
                        onClick={() => toggleProvider(provider)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          filter.selectedProviders?.includes(provider) ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        data-cy={`filter-provider-${provider.toLowerCase()}`}
                      >
                        {provider}
                      </button>
                    ))}
                  </div>
                </div>
                <Checkbox
                  label="Show Active Connections Only"
                  checked={normalizedFilter.showActiveOnly}
                  onChange={(checked) => updateFilter({ showActiveOnly: checked })}
                  data-cy="show-active-checkbox"
                />
              </div>
            </div>

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

      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="External Identity Discovery"
        scriptDescription="Discovering external identity providers and federated access configuration"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? { percentage: progress.percentage || 0, message: progress.message || 'Processing...' } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

export default ExternalIdentityDiscoveryView;
