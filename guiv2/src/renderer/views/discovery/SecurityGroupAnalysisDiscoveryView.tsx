import { useState } from 'react';
import {
  Users,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  GitBranch,
  UserPlus,
  AlertTriangle
} from 'lucide-react';

import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import { useProfileStore } from '../../store/useProfileStore';
import { useState as useReactState, useCallback, useEffect, useRef } from 'react';
import { useDiscoveryStore } from '../../store/useDiscoveryStore';

const SecurityGroupAnalysisDiscoveryView: React.FC = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useReactState<{
    config: { timeout: number };
    result: any;
    isDiscovering: boolean;
    progress: { current: number; total: number; message: string; percentage: number };
    error: string | null;
  }>({
    config: { timeout: 300000 },
    result: null,
    isDiscovering: false,
    progress: { current: 0, total: 100, message: '', percentage: 0 },
    error: null,
  });

  const [configExpanded, setConfigExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Load previous results
  useEffect(() => {
    const previousResults = getResultsByModuleName('SecurityGroupAnalysisDiscovery');
    if (previousResults && previousResults.length > 0) {
      setState(prev => ({ ...prev, result: previousResults[previousResults.length - 1].additionalData }));
    }
  }, [getResultsByModuleName]);

  // Event listeners
  useEffect(() => {
    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const discoveryResult = {
          id: `securitygroup-analysis-discovery-${Date.now()}`,
          name: 'Security Group Analysis Discovery',
          moduleName: 'SecurityGroupAnalysisDiscovery',
          displayName: 'Security Group Analysis Discovery',
          itemCount: data?.result?.totalItems || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalItems || 0} security groups`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };
        setState(prev => ({ ...prev, result: data.result, isDiscovering: false }));
        addResult(discoveryResult);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setState(prev => ({ ...prev, isDiscovering: false, error: data.error }));
      }
    });

    const unsubscribeProgress = window.electron?.onDiscoveryProgress?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setState(prev => ({
          ...prev,
          progress: {
            current: data.itemsProcessed || 0,
            total: data.totalItems || 100,
            message: data.currentPhase || '',
            percentage: data.percentage || 0,
          },
        }));
      }
    });

    return () => {
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeProgress?.();
    };
  }, [addResult]);

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      setState(prev => ({ ...prev, error: 'No profile selected' }));
      return;
    }

    const token = `securitygroup-analysis-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    currentTokenRef.current = token;
    setState(prev => ({ ...prev, isDiscovering: true, error: null, result: null }));

    try {
      await window.electron.executeDiscovery({
        moduleName: 'SecurityGroupAnalysis',
        parameters: {},
        executionOptions: { timeout: 300000, showWindow: false },
        executionId: token,
      });
    } catch (error: any) {
      setState(prev => ({ ...prev, isDiscovering: false, error: error.message }));
    }
  }, [selectedSourceProfile]);

  const cancelDiscovery = useCallback(async () => {
    if (currentTokenRef.current) {
      await window.electron.cancelDiscovery?.(currentTokenRef.current);
      setState(prev => ({ ...prev, isDiscovering: false }));
      currentTokenRef.current = null;
    }
  }, []);

  // Calculate statistics from result
  const stats = state.result ? {
    totalGroups: state.result.totalGroups || state.result.totalItems || 0,
    totalMembers: state.result.totalMembers || 0,
    nestedGroups: state.result.nestedGroups || 0,
    maxNestingLevel: state.result.maxNestingLevel || 0,
    groupsWithNestedMembership: state.result.groupsWithNestedMembership || 0,
    orphanedGroups: state.result.orphanedGroups || 0
  } : null;

  // Column definitions
  const columns = [
    { field: 'Name', headerName: 'Group Name', sortable: true, filter: true, width: 300 },
    { field: 'Type', headerName: 'Type', sortable: true, filter: true, width: 150 },
    { field: 'MemberCount', headerName: 'Direct Members', sortable: true, filter: true, width: 150 },
    { field: 'NestedMemberCount', headerName: 'Nested Members', sortable: true, filter: true, width: 150 },
    { field: 'NestingLevel', headerName: 'Nesting Level', sortable: true, filter: true, width: 130 },
    { field: 'Scope', headerName: 'Scope', sortable: true, filter: true, width: 150 },
    { field: 'Description', headerName: 'Description', sortable: true, filter: true, width: 250 }
  ];

  // Filter data
  const filteredData = state.result?.groups?.filter((group: any) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return JSON.stringify(group).toLowerCase().includes(searchLower);
  }) || [];

  // Export functions
  const exportToCSV = async () => {
    if (!state.result?.groups) return;

    try {
      const csvData = convertToCSV(state.result.groups);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-group-analysis-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const exportToExcel = async () => {
    if (!state.result?.groups) return;

    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Export/ExportToExcel.psm1',
        functionName: 'Export-SecurityGroupData',
        parameters: {
          data: state.result.groups,
          filename: `security-group-analysis-${new Date().toISOString().split('T')[0]}.xlsx`
        }
      });
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="security-group-analysis-discovery-view" data-testid="security-group-analysis-discovery-view">
      {state.isDiscovering && (
        <LoadingOverlay
          progress={typeof state.progress?.percentage === 'number' ? state.progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={state.progress?.message || 'Analyzing security groups...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Group Analysis</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Analyze security groups, member nesting, and group hierarchy visualization
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {stats && stats.totalGroups > 0 && (
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
            disabled={state.isDiscovering}
            variant="primary"
            aria-label="Start discovery"
            data-cy="start-discovery-btn" data-testid="start-discovery-btn"
          >
            {state.isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200">{state.error}</span>
          <Button onClick={() => setState(prev => ({ ...prev, error: null }))} variant="ghost" size="sm">Dismiss</Button>
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
                value={state.config.timeout}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(e.target.value);
                  if (value >= 60000) setState(prev => ({ ...prev, config: { ...prev.config, timeout: value } }));
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
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalGroups.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Groups</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <UserPlus className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalMembers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Members</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <GitBranch className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.nestedGroups.toLocaleString()}</div>
                <div className="text-sm opacity-90">Nested Groups</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <ShieldCheck className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.maxNestingLevel.toLocaleString()}</div>
                <div className="text-sm opacity-90">Max Nesting Level</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <GitBranch className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.groupsWithNestedMembership.toLocaleString()}</div>
                <div className="text-sm opacity-90">Nested Membership</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.orphanedGroups.toLocaleString()}</div>
                <div className="text-sm opacity-90">Orphaned Groups</div>
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
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Security Group Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to analyze security groups and nested membership.</p>
              <Button onClick={startDiscovery} disabled={state.isDiscovering} variant="primary">
                {state.isDiscovering ? 'Discovering...' : 'Start Discovery'}
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
                placeholder="Search security groups..."
                data-cy="search-input" data-testid="search-input"
              />
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid
                data={filteredData}
                columns={columns}
                loading={state.isDiscovering}
                enableColumnReorder
                enableColumnResize
                data-cy={state.isDiscovering ? "grid-loading" : undefined}
              />
            </div>
          </>
        )}
      </div>
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

export default SecurityGroupAnalysisDiscoveryView;
