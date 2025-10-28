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
  sortBy: 'name' | 'lastRun' | 'status' | 'resultCount';
}

/**
 * Default discovery modules registry
 */
const defaultDiscoveryModules: DiscoveryTile[] = [
  {
    id: 'active-directory',
    name: 'Active Directory',
    icon: 'Database',
    description: 'Discover users, groups, computers, OUs, GPOs, and trust relationships from Active Directory',
    route: '/discovery/active-directory',
    status: 'idle',
  },
  {
    id: 'azure-infrastructure',
    name: 'Azure Infrastructure',
    icon: 'Cloud',
    description: 'Discover Azure resources, subscriptions, resource groups, and configurations',
    route: '/discovery/azure',
    status: 'idle',
  },
  {
    id: 'office365',
    name: 'Office 365',
    icon: 'Mail',
    description: 'Discover Microsoft 365 users, mailboxes, licenses, and configurations',
    route: '/discovery/office365',
    status: 'idle',
  },
  {
    id: 'exchange',
    name: 'Exchange',
    icon: 'Inbox',
    description: 'Discover Exchange servers, mailboxes, and email infrastructure',
    route: '/discovery/exchange',
    status: 'idle',
  },
  {
    id: 'sharepoint',
    name: 'SharePoint',
    icon: 'FolderTree',
    description: 'Discover SharePoint sites, libraries, and content',
    route: '/discovery/sharepoint',
    status: 'idle',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    icon: 'Users',
    description: 'Discover Teams, channels, and collaboration data',
    route: '/discovery/teams',
    status: 'idle',
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: 'HardDrive',
    description: 'Discover OneDrive for Business storage and sharing',
    route: '/discovery/onedrive',
    status: 'idle',
  },
  {
    id: 'applications',
    name: 'Applications',
    icon: 'Package',
    description: 'Discover installed applications, dependencies, and versions',
    route: '/discovery/applications',
    status: 'idle',
  },
  {
    id: 'file-system',
    name: 'File System',
    icon: 'Folder',
    description: 'Discover file shares, permissions, and storage',
    route: '/discovery/file-system',
    status: 'idle',
  },
  {
    id: 'network',
    name: 'Network Infrastructure',
    icon: 'Network',
    description: 'Discover network topology, devices, and connections',
    route: '/discovery/network',
    status: 'idle',
  },
  {
    id: 'security',
    name: 'Security Infrastructure',
    icon: 'Shield',
    description: 'Discover security policies, compliance, and vulnerabilities',
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
    id: 'vmware',
    name: 'VMware',
    icon: 'Server',
    description: 'Discover VMware virtual infrastructure and resources',
    route: '/discovery/vmware',
    status: 'idle',
  },
  {
    id: 'hyper-v',
    name: 'Hyper-V',
    icon: 'Server',
    description: 'Discover Hyper-V virtual machines and hosts',
    route: '/discovery/hyper-v',
    status: 'idle',
  },
  {
    id: 'aws',
    name: 'AWS Cloud',
    icon: 'Cloud',
    description: 'Discover Amazon Web Services resources and infrastructure',
    route: '/discovery/aws',
    status: 'idle',
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    icon: 'Mail',
    description: 'Discover Google Workspace users, groups, and data',
    route: '/discovery/google-workspace',
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
    sortBy: 'name',
  });

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

      // Merge with defaults
      const modules = defaultDiscoveryModules.map(module => ({
        ...module,
        lastRun: statusMap[module.id]?.lastRun,
        resultCount: statusMap[module.id]?.resultCount,
        status: statusMap[module.id]?.status || 'idle',
      }));

      setState(prev => ({ ...prev, discoveryModules: modules, isLoading: false }));
    } catch (error) {
      console.error('Failed to load discovery modules:', error);
      setState(prev => ({
        ...prev,
        discoveryModules: defaultDiscoveryModules,
        isLoading: false
      }));
    }
  }, []);

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

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (state.sortBy) {
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
