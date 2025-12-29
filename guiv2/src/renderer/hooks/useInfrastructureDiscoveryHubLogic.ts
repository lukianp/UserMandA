/**
 * Infrastructure Discovery Hub Logic Hook
 * Manages state and business logic for the central discovery dashboard
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  DiscoveryTile,
  DiscoveryResult,
  DiscoveryModuleStatus
} from '../types/models/discovery';
import { getModuleCsvFiles } from '../constants/discoveryModuleMapping';

/**
 * Recent discovery activity entry
 */
interface RecentDiscoveryActivity {
  id: string;
  moduleName: string;
  status: DiscoveryModuleStatus;
  timestamp: Date;
  resultCount: number;
  duration: number; // milliseconds
}

/**
 * Active discovery task
 */
interface ActiveDiscovery {
  id: string;
  moduleName: string;
  progress: number; // 0-100
  currentOperation: string;
  startTime: Date;
}

/**
 * Infrastructure Discovery Hub State
 */
interface InfrastructureDiscoveryHubState {
  discoveryModules: DiscoveryTile[];
  recentActivity: RecentDiscoveryActivity[];
  activeDiscoveries: ActiveDiscovery[];
  queuedDiscoveries: string[];
  isLoading: boolean;
  filter: string;
  selectedCategory: string | null;
  sortBy: 'default' | 'name' | 'lastRun' | 'status' | 'resultCount';
}

/**
 * Default discovery modules registry
 * Order: Azure/M365 Cloud first, Active Directory/On-prem second, Rest alphabetically
 */
const defaultDiscoveryModules: DiscoveryTile[] = [
  // =========================================================================
  // AZURE / MICROSOFT 365 CLOUD (alphabetical)
  // =========================================================================
  {
    id: 'azure-resource',
    name: 'Azure Infrastructure',
    icon: 'Layers',
    description: 'Detailed discovery of Azure resources, VMs, storage, and networking',
    route: '/discovery/azure-resource',
    status: 'idle',
  },
  {
    id: 'conditional-access',
    name: 'Conditional Access',
    icon: 'Lock',
    description: 'Discover conditional access policies, named locations, and authentication requirements',
    route: '/discovery/conditional-access',
    status: 'idle',
  },
  {
    id: 'azure-infrastructure',
    name: 'Entra ID & M365',
    icon: 'Cloud',
    description: 'Discover Entra ID users, groups, security policies, and Microsoft 365 services',
    route: '/discovery/azure',
    status: 'idle',
  },
  {
    id: 'entra-id-app',
    name: 'Entra ID Apps',
    icon: 'AppWindow',
    description: 'Discover Azure AD/Entra ID app registrations, service principals, and permissions',
    route: '/discovery/entra-id-app',
    status: 'idle',
  },
  {
    id: 'exchange',
    name: 'Exchange',
    icon: 'Mail',
    description: 'Discover Exchange servers, mailboxes, distribution groups, and transport rules',
    route: '/discovery/exchange',
    status: 'idle',
  },
  {
    id: 'intune',
    name: 'Intune',
    icon: 'Smartphone',
    description: 'Discover Intune managed devices, policies, and compliance status',
    route: '/discovery/intune',
    status: 'idle',
  },
  {
    id: 'licensing',
    name: 'Licensing',
    icon: 'FileText',
    description: 'Discover software licenses, assignments, and usage',
    route: '/discovery/licensing',
    status: 'idle',
  },
  {
    id: 'graph',
    name: 'Microsoft Graph',
    icon: 'Network',
    description: 'Discover Microsoft Graph API data including users, groups, and organizational data',
    route: '/discovery/graph',
    status: 'idle',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    icon: 'MessageSquare',
    description: 'Discover Teams, channels, memberships, and collaboration data',
    route: '/discovery/teams',
    status: 'idle',
  },
  {
    id: 'office365',
    name: 'Office 365',
    icon: 'Package',
    description: 'Discover Microsoft 365 users, mailboxes, licenses, and configurations',
    route: '/discovery/office365',
    status: 'idle',
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: 'Folders',
    description: 'Discover OneDrive for Business storage, sharing, and sync settings',
    route: '/discovery/onedrive',
    status: 'idle',
  },
  {
    id: 'powerbi',
    name: 'Power BI',
    icon: 'BarChart3',
    description: 'Discover Power BI workspaces, reports, datasets, and sharing settings',
    route: '/discovery/powerbi',
    status: 'idle',
  },
  {
    id: 'power-platform',
    name: 'Power Platform',
    icon: 'Workflow',
    description: 'Discover Power Apps, Power Automate flows, and Power BI workspaces',
    route: '/discovery/power-platform',
    status: 'idle',
  },
  {
    id: 'sharepoint',
    name: 'SharePoint',
    icon: 'Folder',
    description: 'Discover SharePoint sites, libraries, lists, and permissions',
    route: '/discovery/sharepoint',
    status: 'idle',
  },

  // =========================================================================
  // ACTIVE DIRECTORY / ON-PREM DOMAIN (alphabetical)
  // =========================================================================
  {
    id: 'active-directory',
    name: 'Active Directory',
    icon: 'Database',
    description: 'Discover users, groups, computers, OUs, GPOs, and trust relationships from Active Directory',
    route: '/discovery/active-directory',
    status: 'idle',
  },
  {
    id: 'domain',
    name: 'Domain',
    icon: 'Network',
    description: 'Discover domain controllers, FSMO roles, and domain configuration',
    route: '/discovery/domain',
    status: 'idle',
  },
  {
    id: 'gpo',
    name: 'Group Policy',
    icon: 'FileText',
    description: 'Discover Group Policy Objects, settings, and linked OUs',
    route: '/discovery/gpo',
    status: 'idle',
  },
  {
    id: 'multi-domain-forest',
    name: 'Multi-Domain Forest',
    icon: 'GitBranch',
    description: 'Discover multi-domain AD forest structures, trusts, and cross-domain relationships',
    route: '/discovery/multi-domain-forest',
    status: 'idle',
  },

  // =========================================================================
  // OTHER DISCOVERY MODULES (alphabetical)
  // =========================================================================
  {
    id: 'applications',
    name: 'Applications',
    icon: 'Package',
    description: 'Discover installed applications, dependencies, and versions',
    route: '/discovery/applications',
    status: 'idle',
  },
  {
    id: 'aws',
    name: 'AWS',
    icon: 'Cloud',
    description: 'Discover Amazon Web Services resources and infrastructure',
    route: '/discovery/aws',
    status: 'idle',
  },
  {
    id: 'backup-recovery',
    name: 'Backup & Recovery',
    icon: 'HardDrive',
    description: 'Discover backup jobs, retention policies, and recovery points',
    route: '/discovery/backup-recovery',
    status: 'idle',
  },
  {
    id: 'certificate-authority',
    name: 'Certificate Authority',
    icon: 'Shield',
    description: 'Discover PKI infrastructure, CAs, and certificate templates',
    route: '/discovery/certificate-authority',
    status: 'idle',
  },
  {
    id: 'certificate',
    name: 'Certificates',
    icon: 'Key',
    description: 'Discover SSL/TLS certificates, expiration dates, and certificate stores',
    route: '/discovery/certificate',
    status: 'idle',
  },
  {
    id: 'data-classification',
    name: 'Data Classification',
    icon: 'Tag',
    description: 'Discover data classification labels, sensitivity, and compliance tags',
    route: '/discovery/data-classification',
    status: 'idle',
  },
  {
    id: 'database-schema',
    name: 'Database Schema',
    icon: 'Database',
    description: 'Discover database schemas, tables, stored procedures, and relationships',
    route: '/discovery/database-schema',
    status: 'idle',
  },
  {
    id: 'dlp',
    name: 'DLP',
    icon: 'Shield',
    description: 'Discover Data Loss Prevention policies and sensitive data locations',
    route: '/discovery/dlp',
    status: 'idle',
  },
  {
    id: 'dns-dhcp',
    name: 'DNS & DHCP',
    icon: 'Network',
    description: 'Discover DNS zones, records, DHCP scopes, and reservations',
    route: '/discovery/dns-dhcp',
    status: 'idle',
  },
  {
    id: 'environment',
    name: 'Environment',
    icon: 'Radar',
    description: 'Discover environment configuration, variables, and system settings',
    route: '/discovery/environment',
    status: 'idle',
  },
  {
    id: 'external-identity',
    name: 'External Identities',
    icon: 'Users',
    description: 'Discover guest users, B2B collaborators, and external identities',
    route: '/discovery/external-identity',
    status: 'idle',
  },
  {
    id: 'file-server',
    name: 'File Server',
    icon: 'Server',
    description: 'Discover file server configurations, shares, and DFS namespaces',
    route: '/discovery/file-server',
    status: 'idle',
  },
  {
    id: 'file-system',
    name: 'File System',
    icon: 'HardDrive',
    description: 'Discover file shares, NTFS permissions, and storage utilization',
    route: '/discovery/file-system',
    status: 'idle',
  },
  {
    id: 'gcp',
    name: 'GCP',
    icon: 'Cloud',
    description: 'Discover Google Cloud Platform projects, resources, and services',
    route: '/discovery/gcp',
    status: 'idle',
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    icon: 'Cloud',
    description: 'Discover Google Workspace users, groups, and data',
    route: '/discovery/google-workspace',
    status: 'idle',
  },
  {
    id: 'hyper-v',
    name: 'Hyper-V',
    icon: 'Cpu',
    description: 'Discover Hyper-V hosts, virtual machines, and virtual switches',
    route: '/discovery/hyper-v',
    status: 'idle',
  },
  {
    id: 'network',
    name: 'Network Infrastructure',
    icon: 'Network',
    description: 'Discover network topology, subnets, and IP address management',
    route: '/discovery/network',
    status: 'idle',
  },
  {
    id: 'palo-alto',
    name: 'Palo Alto',
    icon: 'Shield',
    description: 'Discover Palo Alto firewall rules, policies, and configurations',
    route: '/discovery/palo-alto',
    status: 'idle',
  },
  {
    id: 'panorama-interrogation',
    name: 'Panorama',
    icon: 'Shield',
    description: 'Discover Palo Alto Panorama managed devices and policies',
    route: '/discovery/panorama-interrogation',
    status: 'idle',
  },
  {
    id: 'physical-server',
    name: 'Physical Server',
    icon: 'Server',
    description: 'Discover physical server hardware, BIOS, and firmware details',
    route: '/discovery/physical-server',
    status: 'idle',
  },
  {
    id: 'printer',
    name: 'Printers',
    icon: 'Printer',
    description: 'Discover print servers, printers, and print queues',
    route: '/discovery/printer',
    status: 'idle',
  },
  {
    id: 'scheduled-task',
    name: 'Scheduled Tasks',
    icon: 'Calendar',
    description: 'Discover Windows scheduled tasks, triggers, and actions',
    route: '/discovery/scheduled-task',
    status: 'idle',
  },
  {
    id: 'security',
    name: 'Security Infrastructure',
    icon: 'Shield',
    description: 'Discover security policies, compliance status, and vulnerabilities',
    route: '/discovery/security',
    status: 'idle',
  },
  {
    id: 'sql-server',
    name: 'SQL Server',
    icon: 'Database',
    description: 'Discover SQL Server instances, databases, and configurations',
    route: '/discovery/sql-server',
    status: 'idle',
  },
  {
    id: 'storage-array',
    name: 'Storage Array',
    icon: 'HardDrive',
    description: 'Discover SAN/NAS storage arrays, volumes, and LUNs',
    route: '/discovery/storage-array',
    status: 'idle',
  },
  {
    id: 'virtualization',
    name: 'Virtualization',
    icon: 'Cpu',
    description: 'General virtualization discovery across multiple platforms',
    route: '/discovery/virtualization',
    status: 'idle',
  },
  {
    id: 'vmware',
    name: 'VMware',
    icon: 'Cpu',
    description: 'Discover VMware vCenter, ESXi hosts, VMs, and datastores',
    route: '/discovery/vmware',
    status: 'idle',
  },
  {
    id: 'web-server',
    name: 'Web Server Config',
    icon: 'Globe',
    description: 'Discover IIS sites, application pools, and web configurations',
    route: '/discovery/web-server',
    status: 'idle',
  },
];

/**
 * Infrastructure Discovery Hub Logic Hook
 */
export const useInfrastructureDiscoveryHubLogic = () => {
  const navigate = useNavigate();

  // State
  const [state, setState] = useState<InfrastructureDiscoveryHubState>({
    discoveryModules: [],
    recentActivity: [],
    activeDiscoveries: [],
    queuedDiscoveries: [],
    isLoading: true,
    filter: '',
    selectedCategory: null,
    sortBy: 'default',
  });

  /**
   * Get the last run date for a discovery module by checking CSV file dates
   *
   * @param moduleId - The discovery module ID
   * @param companyName - The company name for the data path
   * @returns The most recent file modification date, or null if no files found
   */
  const getModuleLastRunDate = useCallback(async (moduleId: string, companyName: string): Promise<Date | null> => {
    try {
      const csvFiles = getModuleCsvFiles(moduleId);

      if (csvFiles.length === 0) {
        return null;
      }

      // Get the base data path for the company
      const basePath = `C:\\DiscoveryData\\${companyName}\\Raw`;

      // Check each CSV file and get the most recent modification date
      let latestDate: Date | null = null;

      for (const csvFile of csvFiles) {
        const fullPath = `${basePath}\\${csvFile}`;

        try {
          // Check if file exists and get its stats
          const stats = await window.electronAPI.fs.stat(fullPath);

          if (stats && stats.modified) {
            const modifiedDate = new Date(stats.modified);

            if (!latestDate || modifiedDate > latestDate) {
              latestDate = modifiedDate;
            }
          }
        } catch (fileError) {
          // File doesn't exist or can't be accessed - skip it
          continue;
        }
      }

      return latestDate;
    } catch (error) {
      console.error(`Failed to get last run date for module ${moduleId}:`, error);
      return null;
    }
  }, []);

  /**
   * Get company name from localStorage or default locations
   */
  const getCompanyName = useCallback((): string => {
    try {
      // Try to get from localStorage first
      const savedProfile = localStorage.getItem('selectedSourceProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        if (profile?.companyName) {
          return profile.companyName;
        }
      }

      // Try to get from profile store state (if available)
      const profileState = localStorage.getItem('profile-store');
      if (profileState) {
        const state = JSON.parse(profileState);
        if (state?.state?.selectedSourceProfile?.companyName) {
          return state.state.selectedSourceProfile.companyName;
        }
      }
    } catch (error) {
      console.warn('Failed to get company name from storage:', error);
    }

    // Default to 'ljpops'
    return 'ljpops';
  }, []);

  /**
   * Load discovery modules and their status
   */
  const loadDiscoveryModules = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Load saved discovery status from localStorage
      const savedStatus = localStorage.getItem('discoveryModulesStatus');
      const statusMap: Record<string, { lastRun?: string; resultCount?: number; status: DiscoveryTile['status'] }> =
        savedStatus ? JSON.parse(savedStatus) : {};

      // Get the company name from localStorage
      const companyName = getCompanyName();

      // Load modules and check for CSV file dates
      const modulesPromises = defaultDiscoveryModules.map(async (module) => {
        // First try to get the last run date from CSV files
        const csvLastRun = await getModuleLastRunDate(module.id, companyName);

        // Use CSV date if available, otherwise fall back to localStorage
        const lastRun = csvLastRun?.toISOString() || statusMap[module.id]?.lastRun;

        return {
          ...module,
          lastRun,
          resultCount: statusMap[module.id]?.resultCount,
          status: statusMap[module.id]?.status || 'idle',
        };
      });

      const modules = await Promise.all(modulesPromises);

      setState(prev => ({ ...prev, discoveryModules: modules, isLoading: false }));
    } catch (error) {
      console.error('Failed to load discovery modules:', error);
      setState(prev => ({
        ...prev,
        discoveryModules: defaultDiscoveryModules,
        isLoading: false
      }));
    }
  }, [getModuleLastRunDate, getCompanyName]);

  /**
   * Load recent discovery activity
   */
  const loadRecentActivity = useCallback(() => {
    try {
      const savedActivity = localStorage.getItem('recentDiscoveryActivity');
      if (savedActivity) {
        const activity: RecentDiscoveryActivity[] = JSON.parse(savedActivity);
        // Convert timestamp strings to Date objects
        const processedActivity = activity.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setState(prev => ({ ...prev, recentActivity: processedActivity }));
      }
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    }
  }, []);

  /**
   * Load active discoveries
   */
  const loadActiveDiscoveries = useCallback(() => {
    // In a real implementation, this would query the backend for running discoveries
    // For now, we'll check localStorage for any in-progress discoveries
    try {
      const savedActive = localStorage.getItem('activeDiscoveries');
      if (savedActive) {
        const active: ActiveDiscovery[] = JSON.parse(savedActive);
        const processedActive = active.map(item => ({
          ...item,
          startTime: new Date(item.startTime),
        }));
        setState(prev => ({ ...prev, activeDiscoveries: processedActive }));
      }
    } catch (error) {
      console.error('Failed to load active discoveries:', error);
    }
  }, []);

  /**
   * Initialize data on mount
   */
  useEffect(() => {
    loadDiscoveryModules();
    loadRecentActivity();
    loadActiveDiscoveries();
  }, [loadDiscoveryModules, loadRecentActivity, loadActiveDiscoveries]);

  /**
   * Subscribe to discovery progress updates
   */
  useEffect(() => {
    const unsubscribe = window.electronAPI?.onProgress?.((data: any) => {
      if (data.type === 'discovery-progress') {
        setState(prev => {
          const activeIndex = prev.activeDiscoveries.findIndex(a => a.id === data.id);
          if (activeIndex >= 0) {
            const updated = [...prev.activeDiscoveries];
            updated[activeIndex] = {
              ...updated[activeIndex],
              progress: data.progress,
              currentOperation: data.currentOperation,
            };
            return { ...prev, activeDiscoveries: updated };
          }
          return prev;
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  /**
   * Filter and sort discovery modules
   */
  const filteredAndSortedModules = useMemo(() => {
    let filtered = state.discoveryModules;

    // Apply text filter
    if (state.filter) {
      const searchLower = state.filter.toLowerCase();
      filtered = filtered.filter(
        module =>
          (module.name ?? '').toLowerCase().includes(searchLower) ||
          (module.description ?? '').toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter (if implemented)
    // if (state.selectedCategory) {
    //   filtered = filtered.filter(m => m.category === state.selectedCategory);
    // }

    // Sort - 'default' preserves the original array order (Azure/M365 first, AD second, rest alphabetical)
    const sorted = [...filtered].sort((a, b) => {
      switch (state.sortBy) {
        case 'default':
          // Preserve original array order - find indices in defaultDiscoveryModules
          const indexA = defaultDiscoveryModules.findIndex(m => m.id === a.id);
          const indexB = defaultDiscoveryModules.findIndex(m => m.id === b.id);
          return indexA - indexB;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastRun':
          if (!a.lastRun && !b.lastRun) return 0;
          if (!a.lastRun) return 1;
          if (!b.lastRun) return -1;
          return new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'resultCount':
          return (b.resultCount || 0) - (a.resultCount || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [state.discoveryModules, state.filter, state.selectedCategory, state.sortBy]);

  /**
   * Launch discovery module
   */
  const launchDiscovery = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  /**
   * Update discovery module status
   */
  const updateModuleStatus = useCallback((
    moduleId: string,
    status: DiscoveryTile['status'],
    resultCount?: number
  ) => {
    setState(prev => {
      const updated = prev.discoveryModules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              status,
              lastRun: new Date().toISOString(),
              resultCount: resultCount ?? module.resultCount
            }
          : module
      );

      // Save to localStorage
      const statusMap = updated.reduce((acc, module) => {
        acc[module.id] = {
          lastRun: module.lastRun,
          resultCount: module.resultCount,
          status: module.status,
        };
        return acc;
      }, {} as Record<string, any>);
      localStorage.setItem('discoveryModulesStatus', JSON.stringify(statusMap));

      return { ...prev, discoveryModules: updated };
    });
  }, []);

  /**
   * Set filter text
   */
  const setFilter = useCallback((filter: string) => {
    setState(prev => ({ ...prev, filter }));
  }, []);

  /**
   * Set sort order
   */
  const setSortBy = useCallback((sortBy: InfrastructureDiscoveryHubState['sortBy']) => {
    setState(prev => ({ ...prev, sortBy }));
  }, []);

  /**
   * Refresh all data
   */
  const refresh = useCallback(() => {
    loadDiscoveryModules();
    loadRecentActivity();
    loadActiveDiscoveries();
  }, [loadDiscoveryModules, loadRecentActivity, loadActiveDiscoveries]);

  return {
    // State
    discoveryModules: filteredAndSortedModules,
    recentActivity: state.recentActivity,
    activeDiscoveries: state.activeDiscoveries,
    queuedDiscoveries: state.queuedDiscoveries,
    isLoading: state.isLoading,
    filter: state.filter,
    sortBy: state.sortBy,

    // Actions
    launchDiscovery,
    updateModuleStatus,
    setFilter,
    setSortBy,
    refresh,
  };
};
