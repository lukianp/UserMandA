/**
 * Infrastructure Discovered View - Multi-Type Tabbed Results
 *
 * Displays discovered data from network infrastructure scanning including:
 * - Network subnets and topology
 * - Discovered hosts with services
 * - Enriched asset inventory
 * - Risk assessments and vulnerabilities
 *
 * Network Topology:
 * - Subnets: AD Sites, DNS zones, and local network segments
 * - Business classification and priority scoring
 *
 * Discovered Devices:
 * - Hosts: Live hosts with open ports and services
 * - Enriched Hosts: Merged with existing asset inventory
 *
 * Risk Analysis:
 * - Service enumeration and vulnerability flags
 * - Legacy OS detection and security assessment
 */

import React, { useState } from 'react';
import {
  Server,
  Network,
  Shield,
  HardDrive,
  Activity,
  AlertTriangle,
  Layers,
  Monitor,
  LucideIcon
} from 'lucide-react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

// Tab configuration for Infrastructure data types
interface InfrastructureDataTab {
  id: string;
  label: string;
  icon: LucideIcon;
  csvPath: string;
  description: string;
  category: 'topology' | 'devices' | 'analysis';
}

const infrastructureDataTabs: InfrastructureDataTab[] = [
  // Network Topology
  {
    id: 'subnets',
    label: 'Network Subnets',
    icon: Network,
    csvPath: 'InfrastructureDiscovery_Subnet.csv',
    description: 'Discovered network subnets from AD Sites, DNS zones, and local adapters with business classification',
    category: 'topology',
  },
  // Discovered Devices
  {
    id: 'hosts',
    label: 'Discovered Hosts',
    icon: Monitor,
    csvPath: 'InfrastructureDiscovery_Host.csv',
    description: 'Live hosts discovered via nmap/PowerShell scanning with open ports and services',
    category: 'devices',
  },
  {
    id: 'enriched-hosts',
    label: 'Asset Inventory',
    icon: HardDrive,
    csvPath: 'InfrastructureDiscovery_EnrichedHost.csv',
    description: 'Discovered hosts enriched with existing asset inventory data for complete device profiles',
    category: 'devices',
  },
  // Analysis
  {
    id: 'windows-servers',
    label: 'Windows Servers',
    icon: Server,
    csvPath: 'InfrastructureDiscovery_Host.csv',
    description: 'Windows servers identified by RDP (3389) and SMB (445) port signatures',
    category: 'analysis',
  },
  {
    id: 'linux-systems',
    label: 'Linux/Unix',
    icon: Layers,
    csvPath: 'InfrastructureDiscovery_Host.csv',
    description: 'Linux and Unix systems identified by SSH port signatures',
    category: 'analysis',
  },
  {
    id: 'high-risk',
    label: 'High Risk Devices',
    icon: AlertTriangle,
    csvPath: 'InfrastructureDiscovery_Host.csv',
    description: 'Devices flagged with high-risk services, legacy OS, or security vulnerabilities',
    category: 'analysis',
  },
];

/**
 * Infrastructure Discovered View Component
 * Provides tabbed navigation for network topology, discovered devices, and risk analysis
 */
export const InfrastructureDiscoveredView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('subnets');
  const currentTab = infrastructureDataTabs.find(t => t.id === activeTab) || infrastructureDataTabs[0];

  // Group tabs by category for visual organization
  const topologyTabs = infrastructureDataTabs.filter(t => t.category === 'topology');
  const deviceTabs = infrastructureDataTabs.filter(t => t.category === 'devices');
  const analysisTabs = infrastructureDataTabs.filter(t => t.category === 'analysis');

  // Category colors
  const getCategoryStyle = (tabId: string, category: string) => {
    if (activeTab !== tabId) {
      return 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700';
    }
    switch (category) {
      case 'topology':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'devices':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
      case 'analysis':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden" data-cy="infrastructure-discovered-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <Server size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Infrastructure Discovery Results</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Network topology, discovered hosts, services, and asset inventory from nmap/PowerShell scanning
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Network size={18} className="text-blue-600 dark:text-blue-400" />
            <div className="text-sm">
              <span className="font-semibold text-blue-700 dark:text-blue-300">Network Scan</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
            <Activity size={18} className="text-emerald-600 dark:text-emerald-400" />
            <div className="text-sm">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">Service Detection</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
            <Shield size={18} className="text-amber-600 dark:text-amber-400" />
            <div className="text-sm">
              <span className="font-semibold text-amber-700 dark:text-amber-300">Risk Assessment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Categories */}
      <div className="px-6 pt-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Network Topology Section */}
        <div className="mb-3">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Network size={12} />
            Network Topology
          </h3>
          <div className="flex gap-1 flex-wrap">
            {topologyTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${getCategoryStyle(tab.id, tab.category)}`}
                title={tab.description}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Discovered Devices Section */}
        <div className="mb-3">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Monitor size={12} />
            Discovered Devices
          </h3>
          <div className="flex gap-1 flex-wrap">
            {deviceTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${getCategoryStyle(tab.id, tab.category)}`}
                title={tab.description}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Section */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Activity size={12} />
            Device Analysis
          </h3>
          <div className="flex gap-1 flex-wrap">
            {analysisTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${getCategoryStyle(tab.id, tab.category)}`}
                title={tab.description}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Tab Description */}
      <div className="px-6 py-3 bg-gray-100 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <currentTab.icon size={16} className="text-gray-500" />
          <span>{currentTab.description}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <DiscoveredViewWrapper
          key={currentTab.id}
          moduleName={`Infrastructure - ${currentTab.label}`}
          csvPath={currentTab.csvPath}
          title={currentTab.label}
          description={currentTab.description}
          enableSearch={true}
          enableExport={true}
          data-cy={`infrastructure-${currentTab.id}-data`}
        />
      </div>
    </div>
  );
};

export default InfrastructureDiscoveredView;


