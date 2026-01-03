import { useState } from 'react';
import {
  Award,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  ShieldAlert,
  ShieldCheck,
  Clock,
  AlertTriangle,
  FileKey
} from 'lucide-react';

import { useCertificateDiscoveryLogic } from '../../hooks/useCertificateDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const CertificateDiscoveryView: React.FC = () => {
  const {
    config,
    result,
    isDiscovering,
    isCancelling,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
    progress,
    error,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    clearError
  } = useCertificateDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Calculate statistics from result
  const stats = result ? {
    totalCertificates: result.totalCertificates || 0,
    expiredCertificates: result.expiredCertificates || 0,
    expiringSoonCertificates: result.expiringSoonCertificates || 0,
    selfSignedCertificates: result.selfSignedCertificates || 0,
    validCertificates: result.statistics?.validCertificates || 0,
    revokedCertificates: result.statistics?.revokedCertificates || 0
  } : null;

  // Column definitions
  const columns = [
    { field: 'SubjectName', headerName: 'Subject', sortable: true, filter: true, width: 300 },
    { field: 'Issuer', headerName: 'Issuer', sortable: true, filter: true, width: 250 },
    { field: 'ExpirationDate', headerName: 'Expires', sortable: true, filter: true, width: 150 },
    { field: 'DaysUntilExpiration', headerName: 'Days Left', sortable: true, filter: true, width: 120 },
    { field: 'IsSelfSigned', headerName: 'Self-Signed', sortable: true, filter: true, width: 120,
      valueFormatter: (params: any) => params.value ? 'Yes' : 'No' },
    { field: 'Location', headerName: 'Location', sortable: true, filter: true, width: 200 },
    { field: 'Thumbprint', headerName: 'Thumbprint', sortable: true, filter: true, width: 250 }
  ];

  // Filter data
  const filteredData = result?.certificates?.filter((cert: any) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return JSON.stringify(cert).toLowerCase().includes(searchLower);
  }) || [];

  // Export functions
  const exportToCSV = async () => {
    if (!result?.certificates) return;

    try {
      const csvData = convertToCSV(result.certificates);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-discovery-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const exportToExcel = async () => {
    if (!result?.certificates) return;

    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Export/ExportToExcel.psm1',
        functionName: 'Export-CertificateData',
        parameters: {
          data: result.certificates,
          filename: `certificate-discovery-${new Date().toISOString().split('T')[0]}.xlsx`
        }
      });
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="certificate-discovery-view" data-testid="certificate-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering certificates...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-yellow-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certificate Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover SSL/TLS certificates, track expiration dates, and identify security risks
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {result && result.certificates && result.certificates.length > 0 && (
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
              <Checkbox
                label="Include Expired Certificates"
                checked={config.includeExpired}
                onChange={(checked) => updateConfig({ includeExpired: checked })}
                data-cy="include-expired-checkbox" data-testid="include-expired-checkbox"
              />
              <Checkbox
                label="Include Self-Signed Certificates"
                checked={config.includeSelfSigned}
                onChange={(checked) => updateConfig({ includeSelfSigned: checked })}
                data-cy="include-selfsigned-checkbox" data-testid="include-selfsigned-checkbox"
              />
              <Checkbox
                label="Include User Certificates"
                checked={config.includeUserCertificates}
                onChange={(checked) => updateConfig({ includeUserCertificates: checked })}
                data-cy="include-user-checkbox" data-testid="include-user-checkbox"
              />
              <Checkbox
                label="Include Computer Certificates"
                checked={config.includeComputerCertificates}
                onChange={(checked) => updateConfig({ includeComputerCertificates: checked })}
                data-cy="include-computer-checkbox" data-testid="include-computer-checkbox"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Days Until Expiration Warning
              </label>
              <Input
                type="number"
                value={config.maxDaysUntilExpiration}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(e.target.value);
                  if (value >= 0) updateConfig({ maxDaysUntilExpiration: value });
                }}
                min={0}
                max={365}
                data-cy="expiration-days-input" data-testid="expiration-days-input"
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
              <FileKey className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalCertificates.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Certificates</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <ShieldAlert className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.expiredCertificates.toLocaleString()}</div>
                <div className="text-sm opacity-90">Expired</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Clock className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.expiringSoonCertificates.toLocaleString()}</div>
                <div className="text-sm opacity-90">Expiring Soon</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.selfSignedCertificates.toLocaleString()}</div>
                <div className="text-sm opacity-90">Self-Signed</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <ShieldCheck className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.validCertificates.toLocaleString()}</div>
                <div className="text-sm opacity-90">Valid</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <ShieldAlert className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.revokedCertificates.toLocaleString()}</div>
                <div className="text-sm opacity-90">Revoked</div>
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
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Certificate Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to scan for certificates and expiration dates.</p>
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
                placeholder="Search certificates..."
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

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Certificate Discovery"
        scriptDescription="Discovering SSL/TLS certificates and tracking expiration dates"
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

export default CertificateDiscoveryView;
