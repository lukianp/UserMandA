/**
 * Entra ID Applications Discovered View
 *
 * Displays discovered data from Entra ID applications, enterprise applications,
 * service principals, and application secrets using tabbed navigation.
 *
 * Enhanced with intelligent classification and filtering to distinguish
 * Microsoft defaults from customer-managed applications.
 *
 * @module entraidapp
 * @category identity
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Settings, Shield, Server, Key, Filter, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';
import { ApplicationFilterPanel } from '../../components/organisms/ApplicationFilterPanel';
import {
  ApplicationClassifierService,
  ApplicationRecord,
  ClassificationResult,
  ApplicationCategory
} from '../../services/applicationClassifierService';
import { ApplicationFilterSettings, DEFAULT_APPLICATION_FILTER_SETTINGS, TenantDomainInfo } from '../../../shared/types/profile';

// Tab configuration for Entra ID app data types
interface EntraIDAppTab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  csvPath: string;
  description: string;
  category: 'applications' | 'security' | 'credentials';
  supportsClassification: boolean;
}

const entraIDAppTabs: EntraIDAppTab[] = [
  {
    id: 'app-registrations',
    label: 'App Registrations',
    icon: Settings,
    csvPath: 'EntraIDAppRegistrations.csv',
    description: 'Azure AD application registrations with permissions and configurations',
    category: 'applications',
    supportsClassification: true,
  },
  {
    id: 'enterprise-apps',
    label: 'Enterprise Applications',
    icon: Server,
    csvPath: 'EntraIDEnterpriseApps.csv',
    description: 'Enterprise applications with SSO configurations and settings',
    category: 'applications',
    supportsClassification: true,
  },
  {
    id: 'service-principals',
    label: 'Service Principals',
    icon: Shield,
    csvPath: 'EntraIDServicePrincipals.csv',
    description: 'Service principals representing applications in the directory',
    category: 'security',
    supportsClassification: true,
  },
  {
    id: 'application-secrets',
    label: 'Application Secrets',
    icon: Key,
    csvPath: 'EntraIDApplicationSecrets.csv',
    description: 'Application secrets and their expiration status',
    category: 'credentials',
    supportsClassification: false, // Secrets don't have app metadata for classification
  },
];

// Category counts interface
interface CategoryCounts {
  MicrosoftDefault: number;
  CustomerManaged: number;
  ThirdParty: number;
  Unknown: number;
}

/**
 * Entra ID Applications discovered data view component
 * Provides tabbed navigation for different types of Entra ID application data
 * with intelligent classification and filtering
 */
export const EntraidappDiscoveredView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('app-registrations');
  const [showFilterPanel, setShowFilterPanel] = useState(true);
  const [filterSettings, setFilterSettings] = useState<ApplicationFilterSettings>(DEFAULT_APPLICATION_FILTER_SETTINGS);
  const [tenantDomains, setTenantDomains] = useState<string[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Raw data and classifications per tab
  const [rawDataByTab, setRawDataByTab] = useState<Record<string, Record<string, any>[]>>({});
  const [classificationsByTab, setClassificationsByTab] = useState<Record<string, Map<string, ClassificationResult>>>({});

  // Classification service instance
  const classifierRef = useRef(new ApplicationClassifierService());

  const currentTab = entraIDAppTabs.find(t => t.id === activeTab) || entraIDAppTabs[0];

  // Group tabs by category for visual organization
  const applicationTabs = entraIDAppTabs.filter(t => t.category === 'applications');
  const securityTabs = entraIDAppTabs.filter(t => t.category === 'security');
  const credentialTabs = entraIDAppTabs.filter(t => t.category === 'credentials');

  // Load filter settings and tenant domains on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoadingSettings(true);

        // Load filter settings from profile
        if (window.electronAPI?.profile?.getApplicationFilterSettings) {
          const settings = await window.electronAPI.profile.getApplicationFilterSettings();
          if (settings) {
            setFilterSettings(settings);
          }
        }

        // Load tenant domains from profile
        if (window.electronAPI?.profile?.getTenantDomains) {
          const domains = await window.electronAPI.profile.getTenantDomains();
          if (domains?.verifiedDomains) {
            setTenantDomains(domains.verifiedDomains);
          }
        }
      } catch (error) {
        console.error('Failed to load application filter settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  // Handle data loaded from DiscoveredViewWrapper
  const handleDataLoaded = useCallback((tabId: string, data: Record<string, any>[], columns: any[]) => {
    // Store raw data
    setRawDataByTab(prev => ({ ...prev, [tabId]: data }));

    // Find the tab config
    const tab = entraIDAppTabs.find(t => t.id === tabId);
    if (!tab?.supportsClassification || !data || data.length === 0) {
      return;
    }

    // Convert to ApplicationRecord format and classify
    const applicationRecords: ApplicationRecord[] = data.map(row => ({
      appId: row.AppId || row.ApplicationId || row.Id || '',
      displayName: row.DisplayName || row.Name || '',
      publisherDomain: row.PublisherDomain || row.Publisher || '',
      publisherName: row.PublisherName || row.Publisher || '',
      appOwnerOrganizationId: row.AppOwnerOrganizationId || row.OwnerOrganizationId || '',
      signInAudience: row.SignInAudience || '',
      tags: Array.isArray(row.Tags) ? row.Tags : (row.Tags ? row.Tags.split(',').map((t: string) => t.trim()) : []),
      servicePrincipalType: row.ServicePrincipalType || row.Type || '',
    }));

    // Classify applications
    const classifications = classifierRef.current.classifyApplications(applicationRecords, tenantDomains);
    setClassificationsByTab(prev => ({ ...prev, [tabId]: classifications }));
  }, [tenantDomains]);

  // Compute category counts for current tab
  const categoryCounts = useMemo<CategoryCounts>(() => {
    const classifications = classificationsByTab[activeTab];
    if (!classifications) {
      return { MicrosoftDefault: 0, CustomerManaged: 0, ThirdParty: 0, Unknown: 0 };
    }

    const counts: CategoryCounts = { MicrosoftDefault: 0, CustomerManaged: 0, ThirdParty: 0, Unknown: 0 };
    classifications.forEach((result) => {
      counts[result.category]++;
    });

    return counts;
  }, [classificationsByTab, activeTab]);

  // Create data filter function for current tab
  const createDataFilter = useCallback((tabId: string) => {
    return (data: Record<string, any>[]) => {
      const classifications = classificationsByTab[tabId];
      if (!classifications || classifications.size === 0) {
        return data;
      }

      return data.filter(row => {
        const appId = row.AppId || row.ApplicationId || row.Id || '';
        const classification = classifications.get(appId);

        if (!classification) {
          // If no classification, show by default (Unknown handling)
          return !filterSettings.hideUnknown;
        }

        // Apply filter rules
        if (classification.category === 'MicrosoftDefault' && filterSettings.hideMicrosoftDefaults) {
          // Check confidence threshold
          if (classification.confidence >= filterSettings.classificationThreshold) {
            // Check if force-included
            if (!filterSettings.customIncludedAppIds.includes(appId)) {
              return false;
            }
          }
        }

        if (classification.category === 'ThirdParty' && filterSettings.hideThirdParty) {
          return false;
        }

        if (classification.category === 'Unknown' && filterSettings.hideUnknown) {
          return false;
        }

        // Check custom exclusions
        if (filterSettings.customExcludedAppIds.includes(appId)) {
          return false;
        }

        return true;
      });
    };
  }, [classificationsByTab, filterSettings]);

  // Handle toggle Microsoft defaults
  const handleToggleMicrosoftDefaults = useCallback(async (show: boolean) => {
    const newSettings = { ...filterSettings, hideMicrosoftDefaults: !show };
    setFilterSettings(newSettings);

    // Persist to profile
    if (window.electronAPI?.profile?.setApplicationFilterSettings) {
      try {
        await window.electronAPI.profile.setApplicationFilterSettings(newSettings);
      } catch (error) {
        console.error('Failed to save filter settings:', error);
      }
    }
  }, [filterSettings]);

  // Handle toggle third party
  const handleToggleThirdParty = useCallback(async (show: boolean) => {
    const newSettings = { ...filterSettings, hideThirdParty: !show };
    setFilterSettings(newSettings);

    if (window.electronAPI?.profile?.setApplicationFilterSettings) {
      try {
        await window.electronAPI.profile.setApplicationFilterSettings(newSettings);
      } catch (error) {
        console.error('Failed to save filter settings:', error);
      }
    }
  }, [filterSettings]);

  // Handle toggle unknown
  const handleToggleUnknown = useCallback(async (show: boolean) => {
    const newSettings = { ...filterSettings, hideUnknown: !show };
    setFilterSettings(newSettings);

    if (window.electronAPI?.profile?.setApplicationFilterSettings) {
      try {
        await window.electronAPI.profile.setApplicationFilterSettings(newSettings);
      } catch (error) {
        console.error('Failed to save filter settings:', error);
      }
    }
  }, [filterSettings]);

  // Refresh classification
  const handleRefreshClassification = useCallback(() => {
    const rawData = rawDataByTab[activeTab];
    if (rawData) {
      handleDataLoaded(activeTab, rawData, []);
    }
  }, [activeTab, rawDataByTab, handleDataLoaded]);

  // Get total and filtered counts
  const totalCount = rawDataByTab[activeTab]?.length || 0;
  const filteredCount = useMemo(() => {
    const rawData = rawDataByTab[activeTab];
    if (!rawData) return 0;
    const filter = createDataFilter(activeTab);
    return filter(rawData).length;
  }, [rawDataByTab, activeTab, createDataFilter]);

  // Classification stats for current tab
  const classificationStats = useMemo(() => {
    const classifications = classificationsByTab[activeTab];
    if (!classifications) return undefined;

    return classifierRef.current.getClassificationStats(classifications);
  }, [classificationsByTab, activeTab]);

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

        {/* Filter toggle button - only show for tabs that support classification */}
        {currentTab.supportsClassification && (
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilterPanel
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            <Filter size={18} />
            <span className="text-sm font-medium">
              {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
            </span>
            {!filterSettings.hideMicrosoftDefaults ? null : (
              <span className="ml-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full">
                Filtering
              </span>
            )}
          </button>
        )}
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
                {tab.supportsClassification && classificationsByTab[tab.id] && (
                  <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                    ({rawDataByTab[tab.id]?.length || 0})
                  </span>
                )}
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

      {/* Content Area with optional filter panel */}
      <div className="flex-1 overflow-hidden flex">
        {/* Filter Panel - Collapsible Sidebar */}
        {currentTab.supportsClassification && showFilterPanel && (
          <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
            <ApplicationFilterPanel
              totalCount={totalCount}
              filteredCount={filteredCount}
              categoryCounts={categoryCounts}
              showMicrosoftDefaults={!filterSettings.hideMicrosoftDefaults}
              onToggleMicrosoftDefaults={handleToggleMicrosoftDefaults}
              showThirdParty={!filterSettings.hideThirdParty}
              onToggleThirdParty={handleToggleThirdParty}
              showUnknown={!filterSettings.hideUnknown}
              onToggleUnknown={handleToggleUnknown}
              classificationStats={classificationStats}
              onRefreshClassification={handleRefreshClassification}
              isLoading={isLoadingSettings}
              tenantDomains={tenantDomains}
            />
          </div>
        )}

        {/* Main Data View */}
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
            dataFilter={currentTab.supportsClassification ? createDataFilter(currentTab.id) : undefined}
            onDataLoaded={(data, columns) => handleDataLoaded(currentTab.id, data, columns)}
          />
        </div>
      </div>
    </div>
  );
};

export default EntraidappDiscoveredView;
