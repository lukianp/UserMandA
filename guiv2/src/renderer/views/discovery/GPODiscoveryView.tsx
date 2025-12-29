/**
 * GPO Discovery View
 * Standardized discovery view following the Intune gold standard pattern
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Link,
  Filter,
  Settings,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

import { useGPODiscoveryLogic } from '../../hooks/useGPODiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const GPODiscoveryView: React.FC = () => {
  const navigate = useNavigate();
  const {
    config,
    result,
    isDiscovering,
    progress,
    error,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    clearError,
  } = useGPODiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'gpos' | 'links'>('overview');
  const [searchText, setSearchText] = useState('');

  // Statistics from result
  const stats = result?.statistics || null;
  const totalGPOs = result?.totalGPOs || 0;
  const totalLinks = result?.totalGPOLinks || 0;
  const totalItems = result?.totalItems || 0;

  // Prepare export payload
  const exportPayload = result ? [result] : [];

  // Simple export functions (mock for now)
  const exportToCSV = (data: any[], filename: string) => {
    console.log('Export to CSV:', filename, data);
    // TODO: Implement CSV export
  };

  const exportToExcel = (data: any[], filename: string) => {
    console.log('Export to Excel:', filename, data);
    // TODO: Implement Excel export
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="gpo-discovery-view" data-testid="gpo-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering Group Policy Objects...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <Shield size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Group Policy Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover Group Policy Objects, settings, and organizational unit linkages to assess policy complexity and plan consolidation
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `gpo-discovery-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                aria-label="Export as CSV"
                data-cy="export-csv-btn" data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `gpo-discovery-${new Date().toISOString().split('T')[0]}.xlsx`)}
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

      {/* Enhanced Error Display with Prerequisites Navigation */}
      {error && (
        <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 rounded-lg shadow-lg">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  GPO Discovery Failed
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3 font-mono bg-red-100 dark:bg-red-900/30 p-2 rounded">
                  {error}
                </p>

                {/* Detect specific error types and provide targeted guidance */}
                {(error.includes('Access is denied') || error.includes('PSRemoting') || error.includes('WinRM')) && (
                  <div className="space-y-2 text-sm text-red-700 dark:text-red-300">
                    <p className="font-semibold">Common causes:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>PowerShell Remoting is not enabled or not configured properly</li>
                      <li>Domain credentials may be incorrect or insufficient</li>
                      <li>GroupPolicy PowerShell module is not installed (RSAT)</li>
                      <li>Insufficient permissions to access Group Policy Objects</li>
                    </ul>

                    <div className="mt-4 pt-3 border-t border-red-300 dark:border-red-700">
                      <p className="font-semibold mb-2">Recommended actions:</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => navigate('/setup/installers')}
                          variant="primary"
                          size="sm"
                          icon={<ExternalLink className="w-4 h-4" />}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Check Prerequisites & Install RSAT
                        </Button>
                        <Button
                          onClick={() => {
                            // Log the error for debugging
                            console.log('[GPODiscoveryView] User viewing error details:', error);
                          }}
                          variant="secondary"
                          size="sm"
                          className="text-red-700 dark:text-red-300 border-red-300 dark:border-red-700"
                        >
                          View Installation Guide
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generic error without specific PSRemoting/Access issues */}
                {!(error.includes('Access is denied') || error.includes('PSRemoting') || error.includes('WinRM')) && (
                  <div className="space-y-2 text-sm text-red-700 dark:text-red-300">
                    <p>Please check the following:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Verify you have saved domain credentials in the profile</li>
                      <li>Ensure the GroupPolicy PowerShell module is installed</li>
                      <li>Check that you have sufficient permissions</li>
                      <li>Review the full error message above</li>
                    </ul>

                    <div className="mt-3 pt-3 border-t border-red-300 dark:border-red-700">
                      <Button
                        onClick={() => navigate('/setup/installers')}
                        variant="secondary"
                        size="sm"
                        icon={<ExternalLink className="w-4 h-4" />}
                        className="text-red-700 dark:text-red-300 border-red-300 dark:border-red-700"
                      >
                        Go to Installers & Dependencies
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={clearError}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              >
                Dismiss
              </Button>
            </div>
          </div>
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
                label="Include GPOs"
                checked={config.includeGPOs}
                onChange={(checked) => updateConfig({ includeGPOs: checked })}
                data-cy="include-gpos-checkbox" data-testid="include-gpos-checkbox"
              />
              <Checkbox
                label="Include GPO Links"
                checked={config.includeGPOLinks}
                onChange={(checked) => updateConfig({ includeGPOLinks: checked })}
                data-cy="include-gpo-links-checkbox" data-testid="include-gpo-links-checkbox"
              />
              <Checkbox
                label="Include GPO Settings"
                checked={config.includeGPOSettings}
                onChange={(checked) => updateConfig({ includeGPOSettings: checked })}
                data-cy="include-gpo-settings-checkbox" data-testid="include-gpo-settings-checkbox"
              />
              <Checkbox
                label="Include GPO Filters"
                checked={config.includeGPOFilters}
                onChange={(checked) => updateConfig({ includeGPOFilters: checked })}
                data-cy="include-gpo-filters-checkbox" data-testid="include-gpo-filters-checkbox"
              />
              <Checkbox
                label="Include WMI Filters"
                checked={config.includeWMIFilters}
                onChange={(checked) => updateConfig({ includeWMIFilters: checked })}
                data-cy="include-wmi-filters-checkbox" data-testid="include-wmi-filters-checkbox"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Results
                </label>
                <Input
                  type="number"
                  value={config.maxResults}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : config.maxResults;
                    const clamped = Math.max(1, Math.min(10000, next));
                    updateConfig({ maxResults: clamped });
                  }}
                  min={1}
                  max={10000}
                  step={100}
                  data-cy="max-results-input" data-testid="max-results-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timeout (seconds)
                </label>
                <Input
                  type="number"
                  value={config.timeout}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const next = Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : config.timeout;
                    const clamped = Math.max(60, Math.min(1800, next));
                    updateConfig({ timeout: clamped });
                  }}
                  min={60}
                  max={1800}
                  step={60}
                  data-cy="timeout-input" data-testid="timeout-input"
                />
              </div>
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
                <div className="text-3xl font-bold">{(stats?.totalPolicies || 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total GPOs</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <FileText className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.enabledGPOs || 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Enabled GPOs</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Settings className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.disabledGPOs || 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Disabled GPOs</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Link className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.linkedGPOs || 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">GPO Links</div>
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
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-overview" data-testid="tab-overview"
          >
            <Shield className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('gpos')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'gpos'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-gpos" data-testid="tab-gpos"
          >
            <FileText className="w-4 h-4" />
            GPOs
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalPolicies || 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'links'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-links" data-testid="tab-links"
          >
            <Link className="w-4 h-4" />
            GPO Links
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.linkedGPOs || 0}</span>}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || (stats?.totalPolicies || 0) === 0) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No GPO Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view Group Policy Objects and their linkages.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && (stats?.totalPolicies || 0) > 0 && (
          <div className="space-y-6 overflow-auto">
            {/* GPO Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">GPO Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total GPOs Discovered</span>
                  <span className="text-lg font-bold text-purple-600">{stats?.totalPolicies || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enabled GPOs</span>
                  <span className="text-lg font-bold text-green-600">{stats?.enabledGPOs || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Disabled GPOs</span>
                  <span className="text-lg font-bold text-gray-600">{stats?.disabledGPOs || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total GPO Links</span>
                  <span className="text-lg font-bold text-blue-600">{stats?.linkedGPOs || 0}</span>
                </div>
              </div>
            </div>

            {/* Discovery Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Discovery Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Records</span>
                  <span className="font-medium text-gray-900 dark:text-white">{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Output Path</span>
                  <span className="font-medium text-gray-900 dark:text-white text-xs break-all">{result?.outputPath || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gpos' && (
          <div className="flex-1 flex flex-col">
            <div className="mb-4">
              <Input
                value={searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                placeholder="Search GPOs..."
                data-cy="search-input" data-testid="search-input"
              />
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>GPO data is stored in CSV files</p>
                <p className="text-sm">Check the output path: {result?.outputPath || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="flex-1 flex flex-col">
            <div className="mb-4">
              <Input
                value={searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                placeholder="Search GPO links..."
                data-cy="search-input" data-testid="search-input"
              />
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Link className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>GPO link data is stored in CSV files</p>
                <p className="text-sm">Check the output path: {result?.outputPath || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GPODiscoveryView;
