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
  } = useInfrastructureDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="infrastructure-discovery-view" data-testid="infrastructure-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={typeof progress?.percentage === 'number' ? progress.percentage : 0}
          onCancel={cancelDiscovery || undefined}
          message={progress?.message || 'Discovering infrastructure...'}
        />
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
            onClick={() => {/* TODO: Export results */}}
            disabled={!result || isDiscovering}
            data-cy="export-results-btn" data-testid="export-results-btn"
          >
            Export
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
          <span className="font-semibold text-gray-900 dark:text-white">Discovery Configuration</span>
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
            </div>
          </div>
        )}
      </div>

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
