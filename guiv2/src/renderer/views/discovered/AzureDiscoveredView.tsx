/**
 * Azure Discovery Discovered View - Enhanced with Multi-Type Tabs
 *
 * Azure Discovery produces multiple data types from different discovery modules.
 * This view provides tabbed navigation to explore each data type separately.
 *
 * Data Types:
 * - Users (AzureIdentityDiscovery) - Azure AD users with migration readiness
 * - Groups (AzureIdentityDiscovery) - Security and M365 groups
 * - Administrative Units (AzureIdentityDiscovery) - Delegated admin model
 * - Applications - App registrations and service principals
 * - Devices - Azure AD and Intune managed devices
 * - Security - Conditional Access policies and directory roles
 * - Infrastructure - VMs, storage, and network resources
 */

import React, { useState } from 'react';
import { Cloud, Users, Shield, Server, Settings, FolderTree, HardDrive } from 'lucide-react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

// Tab configuration for Azure data types
interface AzureDataTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  csvPath: string;
  description: string;
  category: 'identity' | 'security' | 'infrastructure' | 'overview';
}

const azureDataTabs: AzureDataTab[] = [
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    csvPath: 'AzureDiscovery_Users.csv',
    description: 'Azure AD users and guest accounts with migration readiness assessment',
    category: 'identity',
  },
  {
    id: 'groups',
    label: 'Groups',
    icon: Users,
    csvPath: 'AzureDiscovery_Groups.csv',
    description: 'Security groups, Microsoft 365 groups, and distribution lists',
    category: 'identity',
  },
  {
    id: 'admin-units',
    label: 'Administrative Units',
    icon: FolderTree,
    csvPath: 'AzureDiscovery_AdministrativeUnits.csv',
    description: 'Administrative units for delegated administration',
    category: 'identity',
  },
  {
    id: 'applications',
    label: 'Applications',
    icon: Settings,
    csvPath: 'AzureDiscovery_Applications.csv',
    description: 'App registrations and service principals',
    category: 'security',
  },
  {
    id: 'devices',
    label: 'Devices',
    icon: Server,
    csvPath: 'AzureDiscovery_Devices.csv',
    description: 'Azure AD joined and Intune managed devices',
    category: 'infrastructure',
  },
  {
    id: 'conditional-access',
    label: 'Conditional Access',
    icon: Shield,
    csvPath: 'AzureDiscovery_ConditionalAccessPolicies.csv',
    description: 'Conditional Access policies for security enforcement',
    category: 'security',
  },
  {
    id: 'directory-roles',
    label: 'Directory Roles',
    icon: Shield,
    csvPath: 'AzureDiscovery_DirectoryRoles.csv',
    description: 'Azure AD directory roles and assignments',
    category: 'security',
  },
  {
    id: 'virtual-machines',
    label: 'Virtual Machines',
    icon: Server,
    csvPath: 'AzureDiscovery_VirtualMachines.csv',
    description: 'Azure VMs and compute resources',
    category: 'infrastructure',
  },
  {
    id: 'storage',
    label: 'Storage Accounts',
    icon: HardDrive,
    csvPath: 'AzureDiscovery_StorageAccounts.csv',
    description: 'Azure Storage accounts and blob containers',
    category: 'infrastructure',
  },
  {
    id: 'network',
    label: 'Network Security',
    icon: Shield,
    csvPath: 'AzureDiscovery_NetworkSecurityGroups.csv',
    description: 'Network Security Groups and firewall rules',
    category: 'infrastructure',
  },
];

/**
 * Azure Discovery Discovered View Component
 * Provides tabbed navigation for different Azure resource types
 */
export const AzureDiscoveredView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const currentTab = azureDataTabs.find(t => t.id === activeTab) || azureDataTabs[0];

  // Group tabs by category for visual organization
  const identityTabs = azureDataTabs.filter(t => t.category === 'identity');
  const securityTabs = azureDataTabs.filter(t => t.category === 'security');
  const infrastructureTabs = azureDataTabs.filter(t => t.category === 'infrastructure');

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="azure-discovered-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg">
            <Cloud size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Azure Discovery Results</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Microsoft Azure and Entra ID resources
            </p>
          </div>
        </div>
      </div>

      {/* Tab Categories */}
      <div className="px-6 pt-4 bg-white dark:bg-gray-800">
        {/* Identity Section */}
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Identity & Access
          </h3>
          <div className="flex gap-1 flex-wrap">
            {identityTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
                title={tab.description}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Security & Compliance
          </h3>
          <div className="flex gap-1 flex-wrap">
            {securityTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
                title={tab.description}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Infrastructure Section */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Infrastructure
          </h3>
          <div className="flex gap-1 flex-wrap">
            {infrastructureTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
                title={tab.description}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <DiscoveredViewWrapper
          key={currentTab.id}
          moduleName={`Azure - ${currentTab.label}`}
          csvPath={currentTab.csvPath}
          title={currentTab.label}
          description={currentTab.description}
          enableSearch={true}
          enableExport={true}
          data-cy={`azure-${currentTab.id}-data`}
        />
      </div>
    </div>
  );
};

export default AzureDiscoveredView;
