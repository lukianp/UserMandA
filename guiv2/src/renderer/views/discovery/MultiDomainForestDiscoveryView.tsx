import { useState } from 'react';
import {
  GitBranch,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Server,
  Shield,
  Link,
  Users,
  Building,
  Globe,
  CheckCircle,
  Network
} from 'lucide-react';

import { useMultiDomainForestDiscoveryLogic } from '../../hooks/useMultiDomainForestDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const MultiDomainForestDiscoveryView: React.FC = () => {
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
  } = useMultiDomainForestDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  const normalizedFilter = {
    selectedDomains: Array.isArray(filter?.selectedDomains) ? filter.selectedDomains : [],
    selectedSites: Array.isArray(filter?.selectedSites) ? filter.selectedSites : [],
    searchText: filter?.searchText ?? '',
    showTrustsOnly: !!filter?.showTrustsOnly,
  };

  const domainsByFunctionalLevel = stats?.domainsByFunctionalLevel && typeof stats.domainsByFunctionalLevel === 'object' ? stats.domainsByFunctionalLevel : {};
  const sitesByRegion = stats?.sitesByRegion && typeof stats.sitesByRegion === 'object' ? stats.sitesByRegion : {};
  const topDomainControllers = Array.isArray(stats?.topDomainControllers) ? stats.topDomainControllers : [];

  const exportPayload = Array.isArray((result as any)?.data) ? (result as any).data : Array.isArray(result) ? result : [];

  const functionalLevels = ['Windows2003', 'Windows2008', 'Windows2012', 'Windows2016', 'Windows2019', 'Windows2022'];
  const trustTypes = ['Parent-Child', 'External', 'Forest', 'Shortcut'];

  const toggleDomain = (domain: string) => {
    const current = normalizedFilter.selectedDomains;
    const updated = current.includes(domain) ? current.filter(d => d !== domain) : [...current, domain];
    updateFilter({ selectedDomains: updated });
  };

  const toggleSite = (site: string) => {
    const current = normalizedFilter.selectedSites;
    const updated = current.includes(site) ? current.filter(s => s !== site) : [...current, site];
    updateFilter({ selectedSites: updated });
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="multi-domain-forest-discovery-view" data-testid="multi-domain-forest-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering multi-domain forest topology...'}
        />
      )}

      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <GitBranch className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-Domain Forest Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover Active Directory forest topology, domains, sites, and trust relationships for migration planning
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `forest-discovery-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                data-cy="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `forest-discovery-${new Date().toISOString().split('T')[0]}.xlsx`)}
                variant="secondary"
                icon={<FileSpreadsheet className="w-4 h-4" />}
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
            data-cy="start-discovery-btn"
          >
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <Button onClick={clearError} variant="ghost" size="sm">Dismiss</Button>
        </div>
      )}

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
                label="Include All Domains"
                checked={config.includeAllDomains}
                onChange={(checked) => updateConfig({ includeAllDomains: checked })}
                data-cy="include-domains-checkbox"
              />
              <Checkbox
                label="Include Domain Controllers"
                checked={config.includeDomainControllers}
                onChange={(checked) => updateConfig({ includeDomainControllers: checked })}
                data-cy="include-dc-checkbox"
              />
              <Checkbox
                label="Include Trust Relationships"
                checked={config.includeTrusts}
                onChange={(checked) => updateConfig({ includeTrusts: checked })}
                data-cy="include-trusts-checkbox"
              />
              <Checkbox
                label="Include Sites & Subnets"
                checked={config.includeSites}
                onChange={(checked) => updateConfig({ includeSites: checked })}
                data-cy="include-sites-checkbox"
              />
              <Checkbox
                label="Include Global Catalog Servers"
                checked={config.includeGlobalCatalogs}
                onChange={(checked) => updateConfig({ includeGlobalCatalogs: checked })}
                data-cy="include-gc-checkbox"
              />
              <Checkbox
                label="Analyze Replication Topology"
                checked={config.analyzeReplication}
                onChange={(checked) => updateConfig({ analyzeReplication: checked })}
                data-cy="analyze-replication-checkbox"
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

      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <GitBranch className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalDomains ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Domains</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Server className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.domainControllers ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Domain Controllers</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Link className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.trustRelationships ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Trust Relationships</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.sites ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Sites & Subnets</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.globalCatalogs ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Global Catalogs</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Building className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.forestFunctionalLevel ?? 'Unknown')}</div>
                <div className="text-sm opacity-90">Forest Level</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Network className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.replicationConnections ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Replication Links</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{Number(stats?.healthScore ?? 0).toFixed(0)}%</div>
                <div className="text-sm opacity-90">Health Score</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-overview"
          >
            <GitBranch className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('domains')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'domains' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-domains"
          >
            <Building className="w-4 h-4" />
            Domains
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalDomains ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('domain-controllers')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'domain-controllers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-dc"
          >
            <Server className="w-4 h-4" />
            Domain Controllers
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.domainControllers ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('trusts')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'trusts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-trusts"
          >
            <Link className="w-4 h-4" />
            Trusts
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.trustRelationships ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('sites')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'sites' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-sites"
          >
            <Globe className="w-4 h-4" />
            Sites
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.sites ?? 0}</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || (stats?.totalDomains ?? 0) === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Forest Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view multi-domain forest topology.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && Number(stats?.totalDomains ?? 0) > 0 && (
          <div className="space-y-6 overflow-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Domains by Functional Level</h3>
              <div className="space-y-3">
                {Object.entries(domainsByFunctionalLevel).map(([level, count]: [string, unknown]) => {
                  const numCount = Number(count);
                  const totalDomains = Number(stats?.totalDomains ?? 0);
                  return (
                  <div key={level} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">{level}</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-green-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                        style={{ width: `${totalDomains > 0 ? (numCount / totalDomains) * 100 : 0}%` }}
                      >
                        {numCount > 0 && `${numCount}`}
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                      {totalDomains > 0 ? ((numCount / totalDomains) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sites by Region</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(sitesByRegion).map(([region, count]: [string, unknown]) => (
                  <div key={region} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{region}</span>
                    <span className="text-lg font-bold text-green-600">{String(count)}</span>
                  </div>
                ))}
              </div>
            </div>

            {topDomainControllers.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Primary Domain Controllers</h3>
                <div className="space-y-2">
                  {topDomainControllers.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white block">{item.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{item.domain}</span>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                        {item.roles} roles
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                {activeTab === 'trusts' && (
                  <Checkbox
                    label="Show Trust Relationships Only"
                    checked={normalizedFilter.showTrustsOnly}
                    onChange={(checked) => updateFilter({ showTrustsOnly: checked })}
                    data-cy="show-trusts-checkbox"
                  />
                )}
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
        scriptName="Multi-Domain Forest Discovery"
        scriptDescription="Discovering Active Directory forest topology, domains, and trust relationships"
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

export default MultiDomainForestDiscoveryView;
