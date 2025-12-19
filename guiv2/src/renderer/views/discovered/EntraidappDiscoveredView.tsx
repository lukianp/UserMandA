/**
 * Entra ID Applications Discovered View
 *
 * Displays discovered data from Entra ID applications, enterprise applications,
 * service principals, and application secrets using tabbed navigation.
 *
 * @module entraidapp
 * @category identity
 */

import React, { useState } from 'react';
import { Settings, Shield, Server, Key, FileText, Lock } from 'lucide-react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

// Tab configuration for Entra ID app data types
interface EntraIDAppTab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  csvPath: string;
  description: string;
  category: 'applications' | 'security' | 'credentials';
}

const entraIDAppTabs: EntraIDAppTab[] = [
  {
    id: 'app-registrations',
    label: 'App Registrations',
    icon: Settings,
    csvPath: 'EntraIDAppRegistrations.csv',
    description: 'Azure AD application registrations with permissions and configurations',
    category: 'applications',
  },
  {
    id: 'enterprise-apps',
    label: 'Enterprise Applications',
    icon: Server,
    csvPath: 'EntraIDEnterpriseApps.csv',
    description: 'Enterprise applications with SSO configurations and settings',
    category: 'applications',
  },
  {
    id: 'service-principals',
    label: 'Service Principals',
    icon: Shield,
    csvPath: 'EntraIDServicePrincipals.csv',
    description: 'Service principals representing applications in the directory',
    category: 'security',
  },
  {
    id: 'application-secrets',
    label: 'Application Secrets',
    icon: Key,
    csvPath: 'EntraIDApplicationSecrets.csv',
    description: 'Application secrets and their expiration status',
    category: 'credentials',
  },
];

/**
 * Entra ID Applications discovered data view component
 * Provides tabbed navigation for different types of Entra ID application data
 */
export const EntraidappDiscoveredView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('app-registrations');
  const currentTab = entraIDAppTabs.find(t => t.id === activeTab) || entraIDAppTabs[0];

  // Group tabs by category for visual organization
  const applicationTabs = entraIDAppTabs.filter(t => t.category === 'applications');
  const securityTabs = entraIDAppTabs.filter(t => t.category === 'security');
  const credentialTabs = entraIDAppTabs.filter(t => t.category === 'credentials');

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="entraidapp-discovered-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Entra ID Applications</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Application registrations, enterprise applications, service principals, and security credentials from your Microsoft cloud tenant
            </p>
          </div>
        </div>
      </div>

      {/* Tab Categories */}
      <div className="px-6 pt-4 bg-white dark:bg-gray-800">
        {/* Applications Section */}
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Applications
          </h3>
          <div className="flex gap-1 flex-wrap">
            {applicationTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
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
            Security & Access
          </h3>
          <div className="flex gap-1 flex-wrap">
            {securityTabs.map(tab => (
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

        {/* Credentials Section */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Credentials & Secrets
          </h3>
          <div className="flex gap-1 flex-wrap">
            {credentialTabs.map(tab => (
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
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <DiscoveredViewWrapper
          key={currentTab.id}
          moduleName={`Entra ID Apps - ${currentTab.label}`}
          csvPath={currentTab.csvPath}
          title={currentTab.label}
          description={currentTab.description}
          enableSearch={true}
          enableExport={true}
          data-cy={`entraidapp-${currentTab.id}-data`}
        />
      </div>
    </div>
  );
};

export default EntraidappDiscoveredView;