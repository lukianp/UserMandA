import { useState } from 'react';
import {
  Shield,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  ShieldAlert,
  Network,
  Lock,
  AlertTriangle
} from 'lucide-react';

import { usePaloAltoDiscoveryLogic } from '../../hooks/usePaloAltoDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
import { ViewDiscoveredDataButton } from '../../components/molecules/ViewDiscoveredDataButton';

const PaloAltoDiscoveryView: React.FC = () => {
  const {
    config,
    result,
    isDiscovering,
    progress,
    error,
    startDiscovery,
    cancelDiscovery,
    isCancelling,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
  } = usePaloAltoDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Calculate statistics from result
  const stats = result ? {
    totalRules: result.totalRules || result.totalItems || 0,
    totalZones: result.totalZones || 0,
    totalThreats: result.totalThreats || 0,
    criticalRules: result.criticalRules || 0,
    activeRules: result.activeRules || 0,
    unusedRules: result.unusedRules || 0
  } : null;

  // Column definitions
  const columns = [
    { field: 'Name', headerName: 'Rule Name', sortable: true, filter: true, width: 300 },
    { field: 'SourceZone', headerName: 'Source Zone', sortable: true, filter: true, width: 150 },
    { field: 'DestinationZone', headerName: 'Dest Zone', sortable: true, filter: true, width: 150 },
    { field: 'Action', headerName: 'Action', sortable: true, filter: true, width: 120 },
    { field: 'Application', headerName: 'Application', sortable: true, filter: true, width: 200 },
    { field: 'Service', headerName: 'Service', sortable: true, filter: true, width: 150 },
    { field: 'Enabled', headerName: 'Status', sortable: true, filter: true, width: 100,
      valueFormatter: (params: any) => params.value ? 'Enabled' : 'Disabled' }
  ];

  // Filter data
  const filteredData = result?.rules?.filter((rule: any) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return JSON.stringify(rule).toLowerCase().includes(searchLower);
  }) || result?.policies || [];

  // Export functions
  const exportToCSV = async () => {
    if (!result) return;

    try {
      const data = result.rules || result.policies || [];
      const csvData = convertToCSV(data);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `palo-alto-discovery-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const exportToExcel = async () => {
    if (!result) return;

    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Export/ExportToExcel.psm1',
        functionName: 'Export-PaloAltoData',
        parameters: {
          data: result,
          filename: `palo-alto-discovery-${new Date().toISOString().split('T')[0]}.xlsx`
        }
      });
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="palo-alto-discovery-view" data-testid="palo-alto-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering Palo Alto firewall configuration...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Palo Alto Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Analyze firewall policies, security rules, zones, and threat configurations
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {result && (stats?.totalRules || 0) > 0 && (
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
          <Button onClick={() => {}} variant="ghost" size="sm">Dismiss</Button>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeout (ms)
              </label>
              <Input
                type="number"
                value={config.timeout || 300000}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(e.target.value);
                  // Config updates would go through a hook
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalRules.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Rules</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Network className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalZones.toLocaleString()}</div>
                <div className="text-sm opacity-90">Zones</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalThreats.toLocaleString()}</div>
                <div className="text-sm opacity-90">Threats</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <ShieldAlert className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.criticalRules.toLocaleString()}</div>
                <div className="text-sm opacity-90">Critical Rules</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Lock className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.activeRules.toLocaleString()}</div>
                <div className="text-sm opacity-90">Active Rules</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <ShieldAlert className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.unusedRules.toLocaleString()}</div>
                <div className="text-sm opacity-90">Unused Rules</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {!stats && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Palo Alto Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to analyze firewall policies and security rules.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {stats && (
          <>
            {/* Search Filter */}
            <div className="mb-4">
              <Input
                value={searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                placeholder="Search firewall rules..."
                data-cy="search-input" data-testid="search-input"
              />
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid
                data={filteredData}
                columns={columns}
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
          moduleId="palo-alto"
          recordCount={stats?.totalRules || 0}
          disabled={!result || (stats?.totalRules || 0) === 0}
        />
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Palo Alto Discovery"
        scriptDescription="Discovering Palo Alto firewall policies, security rules, and threat configurations"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? {
          percentage: progress.percentage || 0,
          message: progress.message || ''
        } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(header => {
      const value = item[header];
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export default PaloAltoDiscoveryView;
