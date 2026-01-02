import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';

// TypeScript interfaces matching CSV structures
interface AppRegistration {
  ObjectId: string;
  AppId: string;
  DisplayName: string;
  Description: string;
  SignInAudience: string;
  CreatedDateTime: string;
  PublisherDomain: string;
  VerifiedPublisher: string;
  Certification: string;
  IdentifierUris: string;
  ReplyUrls: string;
  HomePage: string;
  LogoutUrl: string;
  Tags: string;
  Notes: string;
  OwnerCount: string;
  Owners: string;
  RequiredResourceAccessCount: string;
  RequiredResourceAppIds: string; // NEW: Semicolon-separated list of API AppIds (for IT Component linking)
  RequiredPermissionCount: string; // NEW: Total number of permissions requested
  AppRoleCount: string;
  OAuth2PermissionScopeCount: string;
  KeyCredentialCount: string;
  PasswordCredentialCount: string;
  HasHighPrivilegePermissions: string;
  _ObjectType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface EnterpriseApp {
  ObjectId: string;
  AppId: string;
  DisplayName: string;
  Description: string;
  ServicePrincipalType: string;
  AccountEnabled: string;
  AppOwnerOrganizationId: string;
  HomePage: string;
  LoginUrl: string;
  LogoutUrl: string;
  PublisherName: string;
  PreferredSingleSignOnMode: string;
  SignInAudience: string;
  AppRoleAssignmentRequired: string;
  CreatedDateTime: string;
  Tags: string;
  NotificationEmailAddresses: string;
  AlternativeNames: string;
  ReplyUrls: string;
  AppRoleCount: string;
  OAuth2PermissionScopeCount: string;
  KeyCredentialCount: string;
  PasswordCredentialCount: string;
  _ObjectType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface ServicePrincipal {
  ObjectId: string;
  AppId: string;
  DisplayName: string;
  ServicePrincipalType: string;
  AccountEnabled: string;
  AppOwnerOrganizationId: string;
  HomePage: string;
  PublisherName: string;
  SignInAudience: string;
  CreatedDateTime: string;
  Tags: string;
  AppRoleCount: string;
  OAuth2PermissionScopeCount: string;
  KeyCredentialCount: string;
  PasswordCredentialCount: string;
  _ObjectType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface ApplicationSecret {
  AppId: string;
  AppDisplayName: string;
  CredentialType: string;
  KeyId: string;
  DisplayName: string;
  Hint: string;
  StartDateTime: string;
  EndDateTime: string;
  DaysUntilExpiry: string;
  Status: string;
  _ObjectType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

type TabType = 'overview' | 'app-registrations' | 'enterprise-apps' | 'service-principals' | 'secrets';

interface Statistics {
  totalAppRegistrations: number;
  totalEnterpriseApps: number;
  totalServicePrincipals: number;
  totalSecrets: number;
  secretsExpiringSoon: number;
  secretsExpired: number;
  secretsValid: number;
  appsWithSecrets: number;
  appsWithCertificates: number;
  enabledServicePrincipals: number;
  disabledServicePrincipals: number;
  appsWithHighPrivileges: number;
  signInAudienceBreakdown: Record<string, number>;
  spTypeBreakdown: Record<string, number>;
  topAppsBySecrets: Array<{ name: string; count: number }>;
  topPublishers: Array<{ name: string; count: number }>;
  // API Dependency statistics (NEW - for IT Component linking)
  appsWithApiDependencies: number;
  totalApiDependencies: number;
  uniqueApiDependencies: number;
  topApiDependencies: Array<{ appId: string; count: number }>;
  discoverySuccessPercentage: number;
  dataSourcesReceivedCount: number;
  dataSourcesTotal: number;
}

export function useEntraIDAppDiscoveredLogic() {
  const { selectedSourceProfile } = useProfileStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for CSV data
  const [appRegistrations, setAppRegistrations] = useState<AppRegistration[]>([]);
  const [enterpriseApps, setEnterpriseApps] = useState<EnterpriseApp[]>([]);
  const [servicePrincipals, setServicePrincipals] = useState<ServicePrincipal[]>([]);
  const [applicationSecrets, setApplicationSecrets] = useState<ApplicationSecret[]>([]);

  const profileName = selectedSourceProfile?.companyName || 'default';
  const basePath = `C:\\DiscoveryData\\${profileName}\\Raw`;

  // Load CSV files
  useEffect(() => {
    const loadData = async () => {
      if (!selectedSourceProfile) {
        setError('No profile selected');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load all 4 CSV files in parallel
        const [appRegsData, enterpriseData, spData, secretsData] = await Promise.all([
          loadCSV<AppRegistration>(`${basePath}\\EntraIDAppRegistrations.csv`),
          loadCSV<EnterpriseApp>(`${basePath}\\EntraIDEnterpriseApps.csv`),
          loadCSV<ServicePrincipal>(`${basePath}\\EntraIDServicePrincipals.csv`),
          loadCSV<ApplicationSecret>(`${basePath}\\EntraIDApplicationSecrets.csv`),
        ]);

        setAppRegistrations(appRegsData);
        setEnterpriseApps(enterpriseData);
        setServicePrincipals(spData);
        setApplicationSecrets(secretsData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading EntraID App data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSourceProfile, basePath]);

  // Helper function to load CSV
  const loadCSV = <T,>(filePath: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      const fs = window.electronAPI?.fs;
      if (!fs) {
        reject(new Error('Electron API not available'));
        return;
      }

      fs.readFile(filePath)
        .then((content: string) => {
          return content;
        })
        .catch((readError: Error) => {
          // File doesn't exist or can't be read
          console.warn(`File not found or unreadable: ${filePath}`, readError);
          return null;
        })
        .then((content: string | null) => {
          if (!content) {
            resolve([]);
            return;
          }

          Papa.parse<T>(content, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors.length > 0) {
                console.warn(`Parse warnings for ${filePath}:`, results.errors);
              }
              resolve(results.data);
            },
            error: (error: Error) => {
              reject(error);
            },
          });
        })
        .catch((error: Error) => {
          console.error(`Error loading ${filePath}:`, error);
          resolve([]);
        });
    });
  };

  // Calculate statistics
  const statistics = useMemo((): Statistics => {
    const totalAppRegistrations = appRegistrations.length;
    const totalEnterpriseApps = enterpriseApps.length;
    const totalServicePrincipals = servicePrincipals.length;
    const totalSecrets = applicationSecrets.length;

    // Secret status breakdown
    const secretsExpiringSoon = applicationSecrets.filter((s) => s.Status === 'ExpiringSoon').length;
    const secretsExpired = applicationSecrets.filter((s) => s.Status === 'Expired').length;
    const secretsValid = applicationSecrets.filter((s) => s.Status === 'Valid').length;

    // Apps with credentials
    const appsWithSecrets = appRegistrations.filter(
      (a) => parseInt(a.PasswordCredentialCount) > 0
    ).length;
    const appsWithCertificates = appRegistrations.filter(
      (a) => parseInt(a.KeyCredentialCount) > 0
    ).length;

    // Service principal status
    const enabledServicePrincipals = servicePrincipals.filter((sp) => sp.AccountEnabled === 'True').length;
    const disabledServicePrincipals = servicePrincipals.filter((sp) => sp.AccountEnabled === 'False').length;

    // High privilege apps
    const appsWithHighPrivileges = appRegistrations.filter(
      (a) => a.HasHighPrivilegePermissions === 'True'
    ).length;

    // SignIn audience breakdown
    const signInAudienceBreakdown: Record<string, number> = {};
    appRegistrations.forEach((app) => {
      const audience = app.SignInAudience || 'Unknown';
      signInAudienceBreakdown[audience] = (signInAudienceBreakdown[audience] || 0) + 1;
    });

    // Service principal type breakdown
    const spTypeBreakdown: Record<string, number> = {};
    servicePrincipals.forEach((sp) => {
      const type = sp.ServicePrincipalType || 'Unknown';
      spTypeBreakdown[type] = (spTypeBreakdown[type] || 0) + 1;
    });

    // Top apps by secret count
    const appSecretCounts = appRegistrations
      .map((app) => ({
        name: app.DisplayName,
        count: parseInt(app.PasswordCredentialCount) + parseInt(app.KeyCredentialCount),
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top publishers
    const publisherCounts: Record<string, number> = {};
    servicePrincipals.forEach((sp) => {
      const publisher = sp.PublisherName || 'Unknown';
      publisherCounts[publisher] = (publisherCounts[publisher] || 0) + 1;
    });
    const topPublishers = Object.entries(publisherCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // API Dependency statistics (NEW - for IT Component linking)
    const appsWithApiDeps = appRegistrations.filter(
      (a) => a.RequiredResourceAppIds && a.RequiredResourceAppIds.trim() !== ''
    );
    const appsWithApiDependencies = appsWithApiDeps.length;

    // Count all API dependencies
    const allApiAppIds: string[] = [];
    appsWithApiDeps.forEach((app) => {
      const appIds = app.RequiredResourceAppIds.split(';').filter((id) => id.trim() !== '');
      allApiAppIds.push(...appIds);
    });
    const totalApiDependencies = allApiAppIds.length;
    const uniqueApiDependencies = new Set(allApiAppIds).size;

    // Top API dependencies (which APIs are used most)
    const apiDepCounts: Record<string, number> = {};
    allApiAppIds.forEach((appId) => {
      apiDepCounts[appId] = (apiDepCounts[appId] || 0) + 1;
    });
    const topApiDependencies = Object.entries(apiDepCounts)
      .map(([appId, count]) => ({ appId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Discovery Success % calculation
    const expectedSources = [
      { name: 'AppRegistrations', hasData: appRegistrations.length > 0, weight: 30 },
      { name: 'EnterpriseApps', hasData: enterpriseApps.length > 0, weight: 25 },
      { name: 'ServicePrincipals', hasData: servicePrincipals.length > 0, weight: 25 },
      { name: 'ApplicationSecrets', hasData: applicationSecrets.length > 0, weight: 20 },
    ];
    const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
    const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);
    const discoverySuccessPercentage = Math.round((achievedWeight / totalWeight) * 100);
    const dataSourcesReceivedCount = expectedSources.filter((s) => s.hasData).length;
    const dataSourcesTotal = expectedSources.length;

    return {
      totalAppRegistrations,
      totalEnterpriseApps,
      totalServicePrincipals,
      totalSecrets,
      secretsExpiringSoon,
      secretsExpired,
      secretsValid,
      appsWithSecrets,
      appsWithCertificates,
      enabledServicePrincipals,
      disabledServicePrincipals,
      appsWithHighPrivileges,
      signInAudienceBreakdown,
      spTypeBreakdown,
      topAppsBySecrets: appSecretCounts,
      topPublishers,
      // API Dependency statistics (NEW)
      appsWithApiDependencies,
      totalApiDependencies,
      uniqueApiDependencies,
      topApiDependencies,
      discoverySuccessPercentage,
      dataSourcesReceivedCount,
      dataSourcesTotal,
    };
  }, [appRegistrations, enterpriseApps, servicePrincipals, applicationSecrets]);

  // Filtered data based on active tab and search
  const filteredData = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    switch (activeTab) {
      case 'app-registrations':
        return appRegistrations.filter(
          (item) =>
            item.DisplayName?.toLowerCase().includes(searchLower) ||
            item.AppId?.toLowerCase().includes(searchLower) ||
            item.PublisherDomain?.toLowerCase().includes(searchLower)
        );
      case 'enterprise-apps':
        return enterpriseApps.filter(
          (item) =>
            item.DisplayName?.toLowerCase().includes(searchLower) ||
            item.AppId?.toLowerCase().includes(searchLower) ||
            item.PublisherName?.toLowerCase().includes(searchLower)
        );
      case 'service-principals':
        return servicePrincipals.filter(
          (item) =>
            item.DisplayName?.toLowerCase().includes(searchLower) ||
            item.AppId?.toLowerCase().includes(searchLower) ||
            item.PublisherName?.toLowerCase().includes(searchLower)
        );
      case 'secrets':
        return applicationSecrets.filter(
          (item) =>
            item.AppDisplayName?.toLowerCase().includes(searchLower) ||
            item.DisplayName?.toLowerCase().includes(searchLower) ||
            item.AppId?.toLowerCase().includes(searchLower)
        );
      default:
        return [];
    }
  }, [activeTab, searchTerm, appRegistrations, enterpriseApps, servicePrincipals, applicationSecrets]);

  // Export to CSV
  const exportToCSV = () => {
    let dataToExport: any[] = [];
    let filename = '';

    switch (activeTab) {
      case 'app-registrations':
        dataToExport = filteredData as AppRegistration[];
        filename = 'EntraID_AppRegistrations_Export.csv';
        break;
      case 'enterprise-apps':
        dataToExport = filteredData as EnterpriseApp[];
        filename = 'EntraID_EnterpriseApps_Export.csv';
        break;
      case 'service-principals':
        dataToExport = filteredData as ServicePrincipal[];
        filename = 'EntraID_ServicePrincipals_Export.csv';
        break;
      case 'secrets':
        dataToExport = filteredData as ApplicationSecret[];
        filename = 'EntraID_ApplicationSecrets_Export.csv';
        break;
      default:
        return;
    }

    if (dataToExport.length === 0) {
      alert('No data to export');
      return;
    }

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    // State
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    loading,
    error,

    // Data
    appRegistrations,
    enterpriseApps,
    servicePrincipals,
    applicationSecrets,
    filteredData,
    statistics,

    // Actions
    exportToCSV,
  };
}
