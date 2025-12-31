/**
 * Network Infrastructure Discovery View
 * Production-ready UI for Network Infrastructure discovery
 */

import React, { useState } from 'react';
import { Network, ChevronDown, ChevronUp, Download, FileSpreadsheet, AlertCircle, Play, XCircle, Router, Server, Shield } from 'lucide-react';

import { useNetworkInfrastructureDiscoveryLogic } from '../../hooks/useNetworkInfrastructureDiscoveryLogic';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

export default function NetworkInfrastructureDiscoveryView() {
  const {
    config,
    result,
    isDiscovering,
    isCancelling,
    progress,
    error,
    logs,
    showExecutionDialog,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    clearError,
    clearLogs,
    setShowExecutionDialog,
  } = useNetworkInfrastructureDiscoveryLogic();

  const [showConfig, setShowConfig] = useState(true);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-testid="network-infrastructure-discovery-view" data-cy="network-infrastructure-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={progress.percentage}
          message={progress.message || 'Discovering Network Infrastructure...'}
          onCancel={cancelDiscovery}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
            <Network className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Network Infrastructure Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Discover routers, switches, firewalls, and VLANs to assess network consolidation needs</p>
          </div>
        </div>

        <div className="flex gap-3">
          {!isDiscovering ? (
            <Button
              variant="primary"
              onClick={startDiscovery}
              icon={<Play className="w-4 h-4" />}
              data-cy="start-discovery-btn"
              data-testid="start-discovery-btn"
            >
              Start Discovery
            </Button>
          ) : (
            <Button
              variant="danger"
              onClick={cancelDiscovery}
              icon={<XCircle className="w-4 h-4" />}
              data-cy="cancel-discovery-btn"
              data-testid="cancel-discovery-btn"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          data-testid="toggle-config-btn"
        >
          <span className="font-medium">Discovery Configuration</span>
          {showConfig ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showConfig && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-medium mb-2">Device Types</h3>
                <Checkbox
                  label="Include Routers"
                  checked={config.includeRouters}
                  onChange={(checked) => updateConfig({ includeRouters: checked })}
                />
                <Checkbox
                  label="Include Switches"
                  checked={config.includeSwitches}
                  onChange={(checked) => updateConfig({ includeSwitches: checked })}
                />
                <Checkbox
                  label="Include Firewalls"
                  checked={config.includeFirewalls}
                  onChange={(checked) => updateConfig({ includeFirewalls: checked })}
                />
                <Checkbox
                  label="Include Load Balancers"
                  checked={config.includeLoadBalancers}
                  onChange={(checked) => updateConfig({ includeLoadBalancers: checked })}
                />
                <Checkbox
                  label="Include Wireless Controllers"
                  checked={config.includeWirelessControllers}
                  onChange={(checked) => updateConfig({ includeWirelessControllers: checked })}
                />
                <Checkbox
                  label="Include VLANs"
                  checked={config.includeVLANs}
                  onChange={(checked) => updateConfig({ includeVLANs: checked })}
                />
              </div>

              <div className="space-y-4">
                <Input
                  label="Max Results"
                  type="number"
                  value={config.maxResults?.toString() || '1000'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateConfig({ maxResults: parseInt(e.target.value) || 1000 })}
                  min={100}
                  max={10000}
                />
                <Input
                  label="Timeout (seconds)"
                  type="number"
                  value={config.timeout?.toString() || '900'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateConfig({ timeout: parseInt(e.target.value) || 900 })}
                  min={60}
                  max={3600}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-900 dark:text-red-200">Error</h4>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={clearError}>Dismiss</Button>
          </div>
        </div>
      )}

      {/* Statistics */}
      {result && (
        <div className="p-6 bg-white dark:bg-gray-800 border-b">
          <h3 className="text-sm font-medium mb-4">Network Infrastructure Statistics</h3>
          <div className="grid grid-cols-6 gap-4">
            <StatCard value={result.totalRouters || 0} label="Routers" color="cyan" icon={<Router className="w-5 h-5" />} />
            <StatCard value={result.totalSwitches || 0} label="Switches" color="blue" icon={<Network className="w-5 h-5" />} />
            <StatCard value={result.totalFirewalls || 0} label="Firewalls" color="red" icon={<Shield className="w-5 h-5" />} />
            <StatCard value={result.totalLoadBalancers || 0} label="Load Balancers" color="green" icon={<Server className="w-5 h-5" />} />
            <StatCard value={result.totalWirelessControllers || 0} label="Wireless" color="purple" icon={<Network className="w-5 h-5" />} />
            <StatCard value={result.totalVLANs || 0} label="VLANs" color="orange" icon={<Network className="w-5 h-5" />} />
          </div>
        </div>
      )}

      {/* Summary */}
      {result && (
        <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Discovery Summary</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <SummaryRow label="Total Routers" value={result.totalRouters || 0} />
                <SummaryRow label="Total Switches" value={result.totalSwitches || 0} />
                <SummaryRow label="Total Firewalls" value={result.totalFirewalls || 0} />
                <SummaryRow label="Total Load Balancers" value={result.totalLoadBalancers || 0} />
                <SummaryRow label="Total Wireless Controllers" value={result.totalWirelessControllers || 0} />
                <SummaryRow label="Total VLANs" value={result.totalVLANs || 0} />
              </div>
              {result.statistics && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Additional Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <SummaryRow label="Total Ports" value={result.statistics.totalPorts || 0} />
                    <SummaryRow label="Total Interfaces" value={result.statistics.totalInterfaces || 0} />
                    <SummaryRow label="Network Segments" value={result.statistics.networkSegments || 0} />
                    <SummaryRow label="Redundancy Level" value={`${result.statistics.redundancyLevel || 0}%`} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!result && !isDiscovering && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Network Data Available</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view network infrastructure insights.</p>
            <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
              Start Discovery
            </Button>
          </div>
        </div>
      )}

      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Network Infrastructure Discovery"
        scriptDescription="Discovering routers, switches, firewalls, load balancers, and VLANs"
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
}

const StatCard: React.FC<{ value: number | string; label: string; color: string; icon?: React.ReactNode }> = ({ value, label, color, icon }) => {
  const colors: Record<string, string> = {
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
  };

  return (
    <div className={`p-4 rounded-lg ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
      </div>
      <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-sm mt-1 opacity-80">{label}</div>
    </div>
  );
};

const SummaryRow: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    <span className="text-sm font-medium">{typeof value === 'number' ? value.toLocaleString() : value}</span>
  </div>
);


