import * as React from 'react';
import { useState } from 'react';
import {
  Globe,
  Server,
  FileCode,
  Link2,
  Database,
  Shield,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';

import { useWebServerDiscoveryLogic } from '../../hooks/useWebServerDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const WebServerConfigurationDiscoveryView: React.FC = () => {
  const {
    config,
    updateConfig,
    isDiscovering,
    progress,
    filter,
    updateFilter,
    startDiscovery,
    cancelDiscovery,
    serverColumns,
    siteColumns,
    bindingColumns,
    appPoolColumns,
    certificateColumns,
    filteredServers,
    filteredSites,
    filteredBindings,
    filteredAppPools,
    filteredCertificates,
    stats,
    exportToCSV,
    exportToExcel
  } = useWebServerDiscoveryLogic();

  const [activeTab, setActiveTab] = useState<'overview' | 'servers' | 'sites' | 'bindings' | 'apppools' | 'certificates'>('overview');
  const [showConfig, setShowConfig] = useState(false);

  const serverTypes = ['iis', 'apache', 'nginx', 'tomcat', 'other'];
  const serverStates = ['running', 'stopped'];

  const toggleServerType = (type: string) => {
    const current = filter.selectedServerTypes;
    const updated = current.includes(type as any)
      ? current.filter(t => t !== type)
      : [...current, type as any];
    updateFilter({ selectedServerTypes: updated });
  };

  const toggleServerState = (state: string) => {
    const current = filter.selectedStates;
    const updated = current.includes(state)
      ? current.filter(s => s !== state)
      : [...current, state];
    updateFilter({ selectedStates: updated });
  };

  const handleExport = (format: 'csv' | 'excel') => {
    let data: any[] = [];
    let filename = '';

    switch (activeTab) {
      case 'servers':
        data = filteredServers;
        filename = `webservers-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
        break;
      case 'sites':
        data = filteredSites;
        filename = `websites-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
        break;
      case 'bindings':
        data = filteredBindings;
        filename = `bindings-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
        break;
      case 'apppools':
        data = filteredAppPools;
        filename = `apppools-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
        break;
      case 'certificates':
        data = filteredCertificates;
        filename = `certificates-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
        break;
    }

    if (format === 'csv') {
      exportToCSV(data, filename);
    } else {
      exportToExcel(data, filename);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="web-server-configuration-discovery-view" data-testid="web-server-configuration-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={progress}
          onCancel={cancelDiscovery}
          message="Discovering web servers..."
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Web Server Configuration</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Discover IIS, Apache, Nginx, and Tomcat configurations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleExport('csv')}
            disabled={!stats || activeTab === 'overview'}
            variant="secondary"
            data-cy="export-csv-btn" data-testid="export-csv-btn"
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button
            onClick={() => handleExport('excel')}
            disabled={!stats || activeTab === 'overview'}
            variant="secondary"
            data-cy="export-excel-btn" data-testid="export-excel-btn"
          >
            <Download className="w-4 h-4" />
            Excel
          </Button>
          <Button
            onClick={startDiscovery}
            disabled={isDiscovering}
            variant="primary"
            data-cy="start-discovery-btn" data-testid="start-discovery-btn"
          >
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-5 gap-4 p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20 rounded-lg border border-sky-200 dark:border-sky-700">
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{stats?.totalServers ?? 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Servers</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.totalSites ?? 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Sites</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.runningServers ?? 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Running Servers</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats?.serversByType ? Object.keys(stats.serversByType).filter(type => stats.serversByType[type] > 0).length : 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Server Types</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200 dark:border-red-700">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats?.expiringCertificates ?? 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Expiring Certs</div>
          </div>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          data-cy="toggle-config" data-testid="toggle-config"
        >
          <span className="font-medium text-gray-900 dark:text-white">Discovery Configuration</span>
          {showConfig ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {showConfig && (
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Server Addresses (comma-separated)
                </label>
                <Input
                  value={(config.serverAddresses || []).join(', ')}
                  onChange={(e) => updateConfig({ serverAddresses: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="server1.domain.com, 192.168.1.100"
                  data-cy="server-addresses-input" data-testid="server-addresses-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timeout (ms)
                </label>
                <Input
                  type="number"
                  value={config.timeout || 300000}
                  onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) })}
                  data-cy="timeout-input" data-testid="timeout-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Discovery Options
              </label>
              <div className="grid grid-cols-3 gap-4">
                <Checkbox
                  checked={config.includeBindings ?? true}
                  onChange={(checked) => updateConfig({ includeBindings: checked })}
                  label="Include Bindings"
                  data-cy="include-bindings" data-testid="include-bindings"
                />
                <Checkbox
                  checked={config.includeApplicationPools ?? true}
                  onChange={(checked) => updateConfig({ includeApplicationPools: checked })}
                  label="Include App Pools"
                  data-cy="include-apppools" data-testid="include-apppools"
                />
                <Checkbox
                  checked={config.includeCertificates ?? true}
                  onChange={(checked) => updateConfig({ includeCertificates: checked })}
                  label="Include Certificates"
                  data-cy="include-certificates" data-testid="include-certificates"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Server Types
              </label>
              <div className="flex flex-wrap gap-2">
                {serverTypes.map(type => {
                  const isSelected = (config.serverTypes || []).includes(type as any);
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        const current = config.serverTypes || [];
                        const updated = isSelected
                          ? current.filter(t => t !== type)
                          : [...current, type as any];
                        updateConfig({ serverTypes: updated });
                      }}
                      className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                        isSelected
                          ? 'bg-sky-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      data-cy={`server-type-${type}`}
                    >
                      {type.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 border-t-2 border-sky-600 font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          data-cy="tab-overview" data-testid="tab-overview"
        >
          <Globe className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('servers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'servers'
              ? 'bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 border-t-2 border-sky-600 font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          data-cy="tab-servers" data-testid="tab-servers"
        >
          <Server className="w-4 h-4" />
          Servers
          {stats && <span className="px-2 py-0.5 text-xs bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 rounded-full">{stats?.totalServers ?? 0}</span>}
        </button>
        <button
          onClick={() => setActiveTab('sites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'sites'
              ? 'bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 border-t-2 border-sky-600 font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          data-cy="tab-sites" data-testid="tab-sites"
        >
          <FileCode className="w-4 h-4" />
          Sites
          {stats && <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">{stats?.totalSites ?? 0}</span>}
        </button>
        <button
          onClick={() => setActiveTab('bindings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'bindings'
              ? 'bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 border-t-2 border-sky-600 font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          data-cy="tab-bindings" data-testid="tab-bindings"
        >
          <Link2 className="w-4 h-4" />
          Bindings
          {filteredBindings.length > 0 && <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">{filteredBindings.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab('apppools')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'apppools'
              ? 'bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 border-t-2 border-sky-600 font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          data-cy="tab-apppools" data-testid="tab-apppools"
        >
          <Database className="w-4 h-4" />
          App Pools
          {filteredAppPools.length > 0 && <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">{filteredAppPools.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'certificates'
              ? 'bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 border-t-2 border-sky-600 font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          data-cy="tab-certificates" data-testid="tab-certificates"
        >
          <Shield className="w-4 h-4" />
          Certificates
          {filteredCertificates.length > 0 && <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full">{filteredCertificates.length}</span>}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* Search and Filters */}
        {activeTab !== 'overview' && (
          <div className="mb-4 space-y-3">
            <Input
              value={filter.searchText}
              onChange={(e) => updateFilter({ searchText: e.target.value })}
              placeholder={`Search ${activeTab}...`}
              data-cy="search-input" data-testid="search-input"
            />

            {activeTab === 'servers' && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Server Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {serverTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => toggleServerType(type)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                          filter.selectedServerTypes.includes(type as any)
                            ? 'bg-sky-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        data-cy={`filter-type-${type}`}
                      >
                        {type.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {serverStates.map(state => (
                      <button
                        key={state}
                        onClick={() => toggleServerState(state)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                          filter.selectedStates.includes(state)
                            ? 'bg-sky-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        data-cy={`filter-state-${state}`}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'certificates' && (
              <Checkbox
                checked={filter.showOnlyExpiring}
                onChange={(checked) => updateFilter({ showOnlyExpiring: checked })}
                label="Show only expiring certificates (< 90 days)"
                data-cy="show-expiring-only" data-testid="show-expiring-only"
              />
            )}
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {activeTab === 'overview' && stats && (
            <div className="h-full overflow-auto p-6 space-y-6">
              {/* Server Type Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5 text-sky-600" />
                  Servers by Type
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {stats?.serversByType ? Object.entries(stats.serversByType).map(([type, count]) => (
                    <div key={type} className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-2xl font-bold text-sky-600">{count}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize mt-1">{type.toUpperCase()}</span>
                    </div>
                  )) : null}
                </div>
              </div>

              {/* Server Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-600" />
                  Server Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Running</span>
                    <span className="text-2xl font-bold text-green-600">{stats?.runningServers ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Stopped</span>
                    <span className="text-2xl font-bold text-red-600">{(stats?.totalServers ?? 0) - (stats?.runningServers ?? 0)}</span>
                  </div>
                </div>
              </div>

              {/* Certificate Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Certificate Status
                </h3>
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Certificates Expiring Soon</span>
                  <span className="text-2xl font-bold text-red-600">{stats?.expiringCertificates ?? 0}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'servers' && (
            <VirtualizedDataGrid
              data={filteredServers}
              columns={serverColumns}
              loading={isDiscovering}
              enableExport
              data-cy="servers-grid" data-testid="servers-grid"
            />
          )}

          {activeTab === 'sites' && (
            <VirtualizedDataGrid
              data={filteredSites}
              columns={siteColumns}
              loading={isDiscovering}
              enableExport
              data-cy="sites-grid" data-testid="sites-grid"
            />
          )}

          {activeTab === 'bindings' && (
            <VirtualizedDataGrid
              data={filteredBindings}
              columns={bindingColumns}
              loading={isDiscovering}
              enableExport
              data-cy="bindings-grid" data-testid="bindings-grid"
            />
          )}

          {activeTab === 'apppools' && (
            <VirtualizedDataGrid
              data={filteredAppPools}
              columns={appPoolColumns}
              loading={isDiscovering}
              enableExport
              data-cy="apppools-grid" data-testid="apppools-grid"
            />
          )}

          {activeTab === 'certificates' && (
            <VirtualizedDataGrid
              data={filteredCertificates}
              columns={certificateColumns}
              loading={isDiscovering}
              enableExport
              data-cy="certificates-grid" data-testid="certificates-grid"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WebServerConfigurationDiscoveryView;
