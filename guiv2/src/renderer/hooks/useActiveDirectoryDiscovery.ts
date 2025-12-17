import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useDiscovery } from "./useDiscovery";
import { LogEntry, ProgressInfo, Profile } from "./common/discoveryHookTypes";

export interface ADObject {
  distinguishedName: string;
  objectClass: string[];
  objectCategory: string;
  name: string;
  samAccountName?: string;
  userPrincipalName?: string;
  mail?: string;
  memberOf?: string[];
  member?: string[];
  whenCreated?: string;
  whenChanged?: string;
  lastLogon?: string;
  pwdLastSet?: string;
  userAccountControl?: number;
  description?: string;
  displayName?: string;
  department?: string;
  title?: string;
  company?: string;
  manager?: string;
  directReports?: string[];
  groups?: ADGroup[];
  metadata?: Record<string, any>;
}

export interface ADGroup {
  distinguishedName: string;
  name: string;
  samAccountName: string;
  description?: string;
  memberCount?: number;
  members?: string[];
  groupType?: number;
  whenCreated?: string;
}

export interface ADDiscoveryArgs {
  baseDN?: string;
  scope?: 'base' | 'onelevel' | 'subtree';
  filter?: string;
  attributes?: string[];
  domainControllers?: string[];
  searchScope?: ('users' | 'groups' | 'computers' | 'ous' | 'all')[];
  includeGroupMembers?: boolean;
  includeNestedGroups?: boolean;
  maxResults?: number;
  pageSize?: number;
}

export interface ADDiscoveryResult {
  objects: ADObject[];
  domain: string;
  objectType: string;
  totalCount?: number;
  nextPage?: string;
}

export interface UseActiveDirectoryDiscoveryResult {
  // Core state
  isRunning: boolean;
  isCancelling: boolean;
  progress: ProgressInfo | null;
  results: ADDiscoveryResult[] | null;
  error: string | null;
  logs: LogEntry[];
  selectedProfile: Profile | null;

  // AD-specific state
  discoveredObjects: ADObject[];
  users: ADObject[];
  groups: ADGroup[];
  computers: ADObject[];
  ous: ADObject[];
  domainSummary: Record<string, number>;
  objectTypeSummary: Record<string, number>;

  // Actions
  startDiscovery: (args?: ADDiscoveryArgs) => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  exportResults: () => Promise<void>;
  clearLogs: () => void;
  exportUsers: () => Promise<void>;
  exportGroups: () => Promise<void>;
  exportByDomain: (domain: string) => Promise<void>;
}

/**
 * Active Directory Discovery Hook with specialized logic
 */
export function useActiveDirectoryDiscovery(profileId: string): UseActiveDirectoryDiscoveryResult {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [discoveredObjects, setDiscoveredObjects] = useState<ADObject[]>([]);

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    setLogs(prev => [...prev, logEntry]);
  }, []);

  // AD-specific validation schema
  const validationSchema = useMemo(() => ({
    required: ['distinguishedName', 'objectClass'],
    transform: (row: any): ADObject => ({
      distinguishedName: row.distinguishedName || row.dn,
      objectClass: Array.isArray(row.objectClass) ? row.objectClass : [row.objectClass],
      objectCategory: row.objectCategory || row.category,
      name: row.name || row.cn,
      samAccountName: row.samAccountName || row.sAMAccountName,
      userPrincipalName: row.userPrincipalName,
      mail: row.mail,
      memberOf: Array.isArray(row.memberOf) ? row.memberOf : row.memberOf ? [row.memberOf] : [],
      member: Array.isArray(row.member) ? row.member : row.member ? [row.member] : [],
      whenCreated: row.whenCreated,
      whenChanged: row.whenChanged,
      lastLogon: row.lastLogon,
      pwdLastSet: row.pwdLastSet,
      userAccountControl: row.userAccountControl,
      description: row.description,
      displayName: row.displayName,
      department: row.department,
      title: row.title,
      company: row.company,
      manager: row.manager,
      directReports: Array.isArray(row.directReports) ? row.directReports : row.directReports ? [row.directReports] : [],
      metadata: row,
    }),
  }), []);

  // AD-specific discovery options
  const discoveryOptions = useMemo(() => ({
    enableCaching: true,
    cacheTTL: 15 * 60 * 1000, // 15 minutes for AD data
    enableRetry: true,
    maxRetries: 2, // AD queries are more sensitive to failures
    enableProgressTracking: true,
    enableCancellation: true,
    incremental: true, // AD supports incremental queries via timestamps
    validationSchema,
  }), [validationSchema]);

  const discovery = useDiscovery("ActiveDirectory", profileId, discoveryOptions);

  // Transform discovery results to AD-specific format
  const results = useMemo((): ADDiscoveryResult[] | null => {
    if (!discovery.rows || discovery.rows.length === 0) return null;

    const groupedByDomain = new Map<string, ADObject[]>();

    discovery.rows.forEach((row: any) => {
      const domain = row.domain || row.dc || 'unknown';
      if (!groupedByDomain.has(domain)) {
        groupedByDomain.set(domain, []);
      }
      groupedByDomain.get(domain)!.push(row);
    });

    return Array.from(groupedByDomain.entries()).map(([domain, objects]) => ({
      objects,
      domain,
      objectType: 'mixed',
      totalCount: objects.length,
    }));
  }, [discovery.rows]);

  // Categorize discovered objects
  const users = useMemo(() => {
    return discoveredObjects.filter(obj =>
      obj.objectClass.includes('user') &&
      !obj.objectClass.includes('computer')
    );
  }, [discoveredObjects]);

  const groups = useMemo((): ADGroup[] => {
    return discoveredObjects
      .filter(obj => obj.objectClass.includes('group'))
      .map(obj => ({
        distinguishedName: obj.distinguishedName,
        name: obj.name,
        samAccountName: obj.samAccountName || '',
        description: obj.description,
        memberCount: obj.member?.length || 0,
        members: obj.member,
        groupType: obj.metadata?.groupType,
        whenCreated: obj.whenCreated,
      }));
  }, [discoveredObjects]);

  const computers = useMemo(() => {
    return discoveredObjects.filter(obj =>
      obj.objectClass.includes('computer')
    );
  }, [discoveredObjects]);

  const ous = useMemo(() => {
    return discoveredObjects.filter(obj =>
      obj.objectClass.includes('organizationalUnit')
    );
  }, [discoveredObjects]);

  // Compute summaries
  const domainSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    discoveredObjects.forEach(obj => {
      const domain = obj.distinguishedName.split(',').filter((part: string) => part.startsWith('DC=')).join(',');
      summary[domain] = (summary[domain] || 0) + 1;
    });
    return summary;
  }, [discoveredObjects]);

  const objectTypeSummary = useMemo(() => {
    const summary: Record<string, number> = {
      users: users.length,
      groups: groups.length,
      computers: computers.length,
      ous: ous.length,
    };
    return summary;
  }, [users.length, groups.length, computers.length, ous.length]);

  // Update discovered objects when results change
  useEffect(() => {
    if (results) {
      const allObjects = results.flatMap(r => r.objects);
      setDiscoveredObjects(allObjects);
    }
  }, [results]);

  const startDiscovery = useCallback(async (args: ADDiscoveryArgs = {}) => {
    addLog('info', `Starting Active Directory discovery for profile: ${profileId}`);

    // Validate AD-specific arguments
    if (!args.baseDN && !args.domainControllers) {
      addLog('warning', 'No base DN or domain controllers specified, discovery may be limited');
    }

    if (args.filter && !args.filter.startsWith('(')) {
      addLog('warning', 'LDAP filter should be enclosed in parentheses');
    }

    // Set selected profile for context
    setSelectedProfile({
      name: `AD-${profileId}`,
      description: `Active Directory discovery profile ${profileId}`
    });

    try {
      await discovery.start(args as Record<string, unknown>);
      addLog('info', 'Active Directory discovery completed successfully');
    } catch (error: any) {
      addLog('error', `Active Directory discovery failed: ${error.message}`);
      throw error;
    }
  }, [discovery, profileId, addLog]);

  const cancelDiscovery = useCallback(async () => {
    addLog('info', 'Cancelling Active Directory discovery');
    await discovery.cancel?.();
  }, [discovery, addLog]);

  const exportResults = useCallback(async () => {
    if (!results) {
      addLog('warning', 'No results to export');
      return;
    }

    // Export logic would go here
    addLog('info', `Exporting ${discoveredObjects.length} Active Directory objects`);
  }, [results, discoveredObjects, addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const exportUsers = useCallback(async () => {
    addLog('info', `Exporting ${users.length} user accounts`);
    // Export logic here
  }, [users, addLog]);

  const exportGroups = useCallback(async () => {
    addLog('info', `Exporting ${groups.length} groups`);
    // Export logic here
  }, [groups, addLog]);

  const exportByDomain = useCallback(async (domain: string) => {
    const domainObjects = discoveredObjects.filter(obj =>
      obj.distinguishedName.includes(domain)
    );
    addLog('info', `Exporting ${domainObjects.length} objects for domain ${domain}`);
    // Export logic here
  }, [discoveredObjects, addLog]);

  return {
    // Core state
    isRunning: discovery.isRunning,
    isCancelling: discovery.isCancelling || false,
    progress: discovery.progress ? {
      current: discoveredObjects.length,
      total: discoveredObjects.length || 100,
      percentage: discovery.progress,
      message: `Discovered ${discoveredObjects.length} Active Directory objects`,
    } : null,
    results,
    error: discovery.error,
    logs,
    selectedProfile,

    // AD-specific state
    discoveredObjects,
    users,
    groups,
    computers,
    ous,
    domainSummary,
    objectTypeSummary,

    // Actions
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,
    exportUsers,
    exportGroups,
    exportByDomain,
  };
}
