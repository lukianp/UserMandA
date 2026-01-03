/**
 * Environment Detection Dashboard Tile
 * Displays current environment statistics on the Overview dashboard
 * Compulsory tile - cannot be removed by users
 */

import React, { useMemo } from 'react';
import { Server, HardDrive, Network, Shield, Cloud, Package, Activity, Monitor } from 'lucide-react';
import { useEnvironmentDetectionDiscoveredLogic } from '../../hooks/useEnvironmentDetectionDiscoveredLogic';

export const EnvironmentDetectionTile: React.FC = () => {
  const { statistics: stats, loading } = useEnvironmentDetectionDiscoveredLogic();

  const tiles = useMemo(() => [
    {
      icon: Monitor,
      label: 'OS',
      value: stats.osName?.split(' ')[0] || 'N/A',
      subtitle: `Build ${stats.osBuild}`,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Activity,
      label: 'Memory',
      value: `${stats.osMemoryUsagePercent}%`,
      subtitle: `${stats.osMemoryGB?.toFixed(0)} GB`,
      gradient: 'from-green-500 to-green-600',
    },
    {
      icon: Network,
      label: 'Network',
      value: stats.activeAdapters,
      subtitle: `${stats.networkAdapterCount} adapters`,
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: HardDrive,
      label: 'Processor',
      value: `${stats.processorCores}`,
      subtitle: 'cores',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: Shield,
      label: 'Domain',
      value: stats.isDomainJoined ? 'Joined' : 'Workgroup',
      subtitle: stats.domainName?.substring(0, 15) || 'N/A',
      gradient: 'from-cyan-500 to-cyan-600',
    },
    {
      icon: Server,
      label: 'Environment',
      value: stats.virtualizationType === 'Physical' ? 'Physical' : 'Virtual',
      subtitle: stats.hypervisorVendor || 'Bare Metal',
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: Cloud,
      label: 'Cloud',
      value: stats.cloudProvider === 'None' ? 'On-Prem' : stats.cloudProvider,
      subtitle: stats.isCloudInstance ? 'Cloud' : 'Local',
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      icon: Package,
      label: 'Applications',
      value: stats.totalApplications || 0,
      subtitle: `${stats.applicationsByArchitecture?.x64 || 0} x64`,
      gradient: 'from-teal-500 to-teal-600',
    },
  ], [stats]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg">
        <div className="animate-pulse text-gray-400">Loading environment data...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Environment Detection</h3>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Local system introspection</p>
      </div>

      {/* Mini Stats Grid */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {tiles.map((tile, idx) => {
          const Icon = tile.icon;
          return (
            <div
              key={idx}
              className={`bg-gradient-to-br ${tile.gradient} text-white rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] opacity-90 font-medium uppercase tracking-wide truncate">{tile.label}</p>
                  <p className="text-lg font-bold leading-tight truncate">{tile.value}</p>
                  <p className="text-[9px] opacity-75 truncate mt-0.5">{tile.subtitle}</p>
                </div>
                <Icon size={16} className="opacity-80 flex-shrink-0 ml-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
