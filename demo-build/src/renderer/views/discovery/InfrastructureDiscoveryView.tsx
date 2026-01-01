/**
 * Infrastructure Discovery View
 * Network scanning with nmap - discover all hosts, ports, services, and OS across subnets
 * Provides comprehensive infrastructure asset inventory for M&A lift-and-shift planning
 */

import React, { useState } from 'react';
import {
  Download,
  Play,
  Square,
  Server,
  Network,
  Monitor,
  HardDrive,
  XCircle,
  Cpu,
  Shield,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

import { useInfrastructureDiscoveryLogic } from '../../hooks/useInfrastructureDiscoveryLogic';
import { useProfileStore } from '../../store/useProfileStore';
import { Button } from '../../components/atoms/Button';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

/**
 * Infrastructure Discovery View Component
 * Network scanner for discovering hosts, services, and OS across all subnets
 */
const InfrastructureDiscoveryView: React.FC = () => {
  const { selectedSourceProfile } = useProfileStore();
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
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    clearError,
    clearLogs,
    addManualSubnet,
    removeManualSubnet,
    clearManualSubnets,
  } = useInfrastructureDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);
  const [diagnosticExpanded, setDiagnosticExpanded] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="infrastructure-discovery-view" data-testid="infrastructure-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering infrastructure...'}
        />
      )}

      {/* Enhanced Progress Section */}
      {isDiscovering && (
        <div className="mx-6 mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Discovery Progress</h3>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {progress?.currentPhase || 'Processing...'}
            </span>
          </div>

          {/* Overall Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mb-1">
              <span>Overall Progress</span>
              <span>{progress?.percentage || 0}%</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress?.percentage || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Subnet Progress */}
          {progress?.totalSubnets && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mb-1">
                <span>Subnet Scanning</span>
                <span>{progress?.completedSubnets || 0} / {progress?.totalSubnets}</span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div
                  className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress?.totalSubnets ? ((progress?.completedSubnets || 0) / progress.totalSubnets) * 100 : 0}%` }}
                ></div>
              </div>
              {progress?.currentSubnet && (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Current: {progress.currentSubnet}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <Server size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Infrastructure Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Network scanning with nmap - discover hosts, ports, services, and OS across all subnets for lift-and-shift planning
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={() => {
              if (!result) return;

              try {
                // Create comprehensive export data
                const exportData = {
                  metadata: {
                    discoveryTime: result.discoveryTime || new Date().toISOString(),
                    totalItems: result.totalItems || 0,
                    duration: result.duration || 0,
                    outputPath: result.outputPath || '',
                  },
                  statistics: result.statistics || {},
                  servers: result.servers || [],
                  networkDevices: result.networkDevices || [],
                  storageDevices: result.storageDevices || [],
                  securityDevices: result.securityDevices || [],
                  virtualization: result.virtualization || [],
                  diagnostics: result.diagnostics || {},
                  manualSubnets: config.manualSubnets || [],
                  exportTimestamp: new Date().toISOString(),
                };

                // Convert to JSON and download
                const jsonString = JSON.stringify(exportData, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `infrastructure-discovery-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // Also create CSV summary
                const csvData = [
                  ['Category', 'Count'],
                  ['Total Items', exportData.metadata.totalItems],
                  ['Servers', exportData.servers.length],
                  ['Network Devices', exportData.networkDevices.length],
                  ['Storage Devices', exportData.storageDevices.length],
                  ['Security Devices', exportData.securityDevices.length],
                  ['Virtualization', exportData.virtualization.length],
                ];

                const csvString = csvData.map(row => row.join(',')).join('\n');
                const csvBlob = new Blob([csvString], { type: 'text/csv' });
                const csvUrl = URL.createObjectURL(csvBlob);

                const csvLink = document.createElement('a');
                csvLink.href = csvUrl;
                csvLink.download = `infrastructure-summary-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(csvLink);
                csvLink.click();
                document.body.removeChild(csvLink);
                URL.revokeObjectURL(csvUrl);

              } catch (error) {
                console.error('Export failed:', error);
              }
            }}
            disabled={!result || isDiscovering}
            data-cy="export-results-btn" data-testid="export-results-btn"
          >
            Export Results
          </Button>
          <Button
            onClick={startDiscovery}
            disabled={isDiscovering || !selectedSourceProfile}
            variant="primary"
            icon={isDiscovering ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            data-cy="start-discovery-btn" data-testid="start-discovery-btn"
          >
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Diagnostic Tools Panel */}
      <div className="mx-6 mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow">
        <button
          onClick={() => setDiagnosticExpanded(!diagnosticExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-green-100 dark:hover:bg-green-800/30 rounded-lg transition-colors"
          data-cy="diagnostic-toggle" data-testid="diagnostic-toggle"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500 text-white">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">Network Diagnostic Tools</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Test connectivity and validate scanning capabilities before discovery</p>
            </div>
          </div>
          {diagnosticExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </button>

        {diagnosticExpanded && (
          <div className="p-4 border-t border-green-200 dark:border-green-700 space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  // Show diagnostic information from the last discovery run
                  if (result?.diagnostics) {
                    setDiagnosticResults({
                      internetConnectivity: result.diagnostics.ConnectivityTests?.some((test: { Test: string; Result: string }) => test.Result === 'PASS') || false,
                      nmapAvailable: result.diagnostics.AlternativeScans?.length > 0 || false,
                      timestamp: new Date().toISOString(),
                      recommendations: result.diagnostics.Recommendations || [],
                      error: undefined
                    });
                  } else {
                    setDiagnosticResults({
                      error: 'No diagnostic data available. Run a discovery first.',
                      timestamp: new Date().toISOString(),
                    });
                  }
                }}
                disabled={isDiscovering}
                variant="secondary"
                icon={<Monitor className="w-4 h-4" />}
                data-cy="run-diagnostics-btn" data-testid="run-diagnostics-btn"
              >
                View Last Diagnostics
              </Button>

              <Button
                onClick={() => setDiagnosticResults(null)}
                disabled={!diagnosticResults}
                variant="ghost"
                size="sm"
                data-cy="clear-diagnostics-btn" data-testid="clear-diagnostics-btn"
              >
                Clear
              </Button>
            </div>

            {/* Diagnostic Results */}
            {diagnosticResults && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Diagnostic Results</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg ${diagnosticResults.internetConnectivity ? 'bg-green-100 dark:bg-green-800/30' : 'bg-red-100 dark:bg-red-800/30'}`}>
                    <div className="flex items-center gap-2">
                      {diagnosticResults.internetConnectivity ? (
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      )}
                      <span className="text-sm font-medium">Internet Connectivity</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {diagnosticResults.internetConnectivity ? 'Connected' : 'Not connected'}
                    </p>
                  </div>

                  <div className={`p-3 rounded-lg ${diagnosticResults.nmapAvailable ? 'bg-green-100 dark:bg-green-800/30' : 'bg-yellow-100 dark:bg-yellow-800/30'}`}>
                    <div className="flex items-center gap-2">
                      {diagnosticResults.nmapAvailable ? (
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      )}
                      <span className="text-sm font-medium">Nmap Availability</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {diagnosticResults.nmapAvailable ? 'Available' : 'Using PowerShell alternatives'}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                {diagnosticResults.recommendations && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</h5>
                    <div className="space-y-1">
                      {diagnosticResults.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-xs">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {diagnosticResults.error && (
                  <div className="p-3 bg-red-100 dark:bg-red-800/30 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">{diagnosticResults.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between" data-cy="error-section" data-testid="error-section">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
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
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white">Discovery Configuration</span>
            <div
              className="relative group"
              title="Configure what types of infrastructure to discover and scanning options"
            >
              <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                Configure discovery scope and options
              </div>
            </div>
          </div>
          {configExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </button>

        {configExpanded && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Checkbox
                label="Include Servers"
                checked={config.includeServers}
                onChange={(checked: boolean) => updateConfig({ includeServers: checked })}
                data-cy="include-servers-checkbox" data-testid="include-servers-checkbox"
              />
              <Checkbox
                label="Include Network Devices"
                checked={config.includeNetworkDevices}
                onChange={(checked: boolean) => updateConfig({ includeNetworkDevices: checked })}
                data-cy="include-network-checkbox" data-testid="include-network-checkbox"
              />
              <Checkbox
                label="Include Storage Devices"
                checked={config.includeStorageDevices}
                onChange={(checked: boolean) => updateConfig({ includeStorageDevices: checked })}
                data-cy="include-storage-checkbox" data-testid="include-storage-checkbox"
              />
              <Checkbox
                label="Include Security Devices"
                checked={config.includeSecurityDevices}
                onChange={(checked: boolean) => updateConfig({ includeSecurityDevices: checked })}
                data-cy="include-security-checkbox" data-testid="include-security-checkbox"
              />
              <Checkbox
                label="Include Virtualization"
                checked={config.includeVirtualization}
                onChange={(checked: boolean) => updateConfig({ includeVirtualization: checked })}
                data-cy="include-virt-checkbox" data-testid="include-virt-checkbox"
              />
              <Checkbox
                label="Enable Diagnostics"
                checked={config.enableDiagnostics}
                onChange={(checked: boolean) => updateConfig({ enableDiagnostics: checked })}
                data-cy="enable-diagnostics-checkbox" data-testid="enable-diagnostics-checkbox"
              />
            </div>

            {/* Manual Subnet Configuration */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Manual Subnets (CIDR notation)
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearManualSubnets}
                  disabled={config.manualSubnets.length === 0}
                  data-cy="clear-subnets-btn" data-testid="clear-subnets-btn"
                >
                  Clear All
                </Button>
              </div>

              {/* Manual Subnet Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., 192.168.1.0/24"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      const subnet = input.value.trim();
                      if (subnet) {
                        // Basic CIDR validation
                        if (/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(subnet)) {
                          addManualSubnet(subnet);
                          input.value = '';
                        } else {
                          input.classList.add('border-red-500');
                          setTimeout(() => input.classList.remove('border-red-500'), 2000);
                        }
                      }
                    }
                  }}
                  data-cy="subnet-input" data-testid="subnet-input"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder*="192.168.1.0/24"]') as HTMLInputElement;
                    const subnet = input?.value?.trim();
                    if (subnet) {
                      if (/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(subnet)) {
                        addManualSubnet(subnet);
                        input.value = '';
                      } else {
                        input?.classList.add('border-red-500');
                        setTimeout(() => input?.classList.remove('border-red-500'), 2000);
                      }
                    }
                  }}
                  data-cy="add-subnet-btn" data-testid="add-subnet-btn"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Manual Subnet List */}
              {config.manualSubnets.length > 0 && (
                <div className="space-y-2">
                  {config.manualSubnets.map((subnet, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
                      data-cy={`manual-subnet-${index}`} data-testid={`manual-subnet-${index}`}
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        {subnet}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeManualSubnet(subnet)}
                        data-cy={`remove-subnet-${index}`} data-testid={`remove-subnet-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Subnet Classification Dashboard */}
      <div className="mx-6 mt-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500 text-white">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Subnet Classification & Scanning Strategy</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">Intelligent network segmentation for optimized discovery</p>
            </div>
          </div>

          {/* Classification Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="flex items-center gap-2 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs font-medium text-red-800 dark:text-red-200">Critical Infra</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-xs font-medium text-orange-800 dark:text-orange-200">Management</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-medium text-blue-800 dark:text-blue-200">Infrastructure</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200">User Networks</span>
            </div>
          </div>

          {/* Scanning Parameters Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Scanning Strategy Preview</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Priority Order:</span>
                <div className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1">
                  Critical → Management → Infrastructure → User Networks
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Timing Strategy:</span>
                <div className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1">
                  T4 (Critical) → T3 (Infra) → T2 (User)
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Port Scanning:</span>
                <div className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1">
                  5 ports (Critical) → 18 ports (Infra) → 80+ ports (Deep)
                </div>
              </div>
            </div>

            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded-full mt-0.5 flex-shrink-0"></div>
                <div className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Production Safety:</strong> All scanning parameters automatically adjust for production environments with slower timing, fewer concurrent scans, and administrator approval requirements.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic Results */}
      {(result as any)?.diagnostics && (
        <div className="mx-6 mt-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Network Diagnostics
            </h2>

            {/* Connectivity Tests */}
            {(result as any).diagnostics.ConnectivityTests && (result as any).diagnostics.ConnectivityTests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Connectivity Tests</h3>
                <div className="space-y-2">
                  {(result as any).diagnostics.ConnectivityTests.map((test: any, index: number) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                      test.Result === 'PASS' ? 'bg-green-50 dark:bg-green-900/20' :
                      test.Result === 'FAIL' ? 'bg-red-50 dark:bg-red-900/20' :
                      'bg-yellow-50 dark:bg-yellow-900/20'
                    }`}>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {test.Test}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${
                          test.Result === 'PASS' ? 'text-green-600' :
                          test.Result === 'FAIL' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {test.Result}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative Scans */}
            {(result as any).diagnostics.AlternativeScans && (result as any).diagnostics.AlternativeScans.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Alternative Scan Results</h3>
                <div className="space-y-2">
                  {(result as any).diagnostics.AlternativeScans.map((scan: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {scan.Method}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {scan.Details}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {scan.HostsFound} hosts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {(result as any).diagnostics.Recommendations && (result as any).diagnostics.Recommendations.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Recommendations</h3>
                <div className="space-y-2">
                  {(result as any).diagnostics.Recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {rec}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {result && (
        <div className="grid grid-cols-5 gap-4 p-6">
          {/* Servers */}
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white" data-cy="stat-servers" data-testid="stat-servers">
            <div className="flex items-center justify-between">
              <Monitor className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{result.totalServers || 0}</div>
                <div className="text-sm opacity-90">Servers</div>
              </div>
            </div>
          </div>

          {/* Network Devices */}
          <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow text-white" data-cy="stat-network" data-testid="stat-network">
            <div className="flex items-center justify-between">
              <Network className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{result.totalNetworkDevices || 0}</div>
                <div className="text-sm opacity-90">Network Devices</div>
              </div>
            </div>
          </div>

          {/* Storage Devices */}
          <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow text-white" data-cy="stat-storage" data-testid="stat-storage">
            <div className="flex items-center justify-between">
              <HardDrive className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{result.totalStorageDevices || 0}</div>
                <div className="text-sm opacity-90">Storage Devices</div>
              </div>
            </div>
          </div>

          {/* Security Devices */}
          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white" data-cy="stat-security" data-testid="stat-security">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{result.totalSecurityDevices || 0}</div>
                <div className="text-sm opacity-90">Security Devices</div>
              </div>
            </div>
          </div>

          {/* Virtualization */}
          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white" data-cy="stat-virt" data-testid="stat-virt">
            <div className="flex items-center justify-between">
              <Cpu className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{result.totalVirtualization || 0}</div>
                <div className="text-sm opacity-90">Virtualization</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Troubleshooting Alert for Zero Results */}
      {result && (result.totalItems === 0 || ((result.totalServers || 0) + (result.totalNetworkDevices || 0) + (result.totalStorageDevices || 0) + (result.totalSecurityDevices || 0) + (result.totalVirtualization || 0)) === 0) && (
        <div className="mx-6 mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">No Infrastructure Found</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                The discovery completed successfully but found 0 infrastructure items. This could be due to:
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 mb-3">
                <li>• Network firewalls blocking scanning traffic</li>
                <li>• Limited network access or VPN requirements</li>
                <li>• Target subnets not responding to discovery probes</li>
                <li>• Nmap not available (using PowerShell alternatives)</li>
              </ul>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setDiagnosticExpanded(true)}
                  className="text-xs"
                >
                  Run Diagnostics
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setConfigExpanded(true)}
                  className="text-xs"
                >
                  Add Manual Subnets
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {result ? (
          <div className="h-full overflow-y-auto p-6" data-cy="results-content" data-testid="results-content">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Discovery Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Infrastructure Scan Summary
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Items Discovered</span>
                    <span className="text-lg font-bold text-blue-600">
                      {result.totalItems ||
                        ((result.totalServers || 0) +
                         (result.totalNetworkDevices || 0) +
                         (result.totalStorageDevices || 0) +
                         (result.totalSecurityDevices || 0) +
                         (result.totalVirtualization || 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Output Path</span>
                    <span className="text-sm font-medium text-purple-600 truncate max-w-xs">
                      {result.outputPath || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              {result.statistics && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Detailed Statistics
                  </h2>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Physical Servers</span>
                      <span className="text-lg font-bold text-blue-600">{result.statistics.physicalServers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Virtual Servers</span>
                      <span className="text-lg font-bold text-purple-600">{result.statistics.virtualServers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Storage (TB)</span>
                      <span className="text-lg font-bold text-amber-600">{result.statistics.totalStorage || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Network Segments</span>
                      <span className="text-lg font-bold text-emerald-600">{result.statistics.networkSegments || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Server className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Infrastructure Data</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to scan your network infrastructure.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering || !selectedSourceProfile} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Infrastructure Discovery"
        scriptDescription="Scanning network infrastructure for servers, devices, and services"
        logs={logs.map(log => ({
          timestamp: log.timestamp,
          message: log.message,
          level: log.level as 'info' | 'success' | 'warning' | 'error'
        }))}
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

export default InfrastructureDiscoveryView;


