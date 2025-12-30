/**
 * Enterprise Systems Integration Hook
 *
 * Provides data extraction capabilities for enterprise systems:
 * - ServiceNow (ITSM, CMDB, HR Service Delivery)
 * - Jira/Atlassian (Project Management, Service Desk)
 * - Workday (HCM, Finance, Payroll)
 * - LeanIX (Enterprise Architecture)
 *
 * Phase 10: Enterprise Systems Integration for M&A Due Diligence
 */

import { useState, useCallback, useMemo } from 'react';
import { useProfileStore } from '../store/useProfileStore';

// ===== TYPE DEFINITIONS =====

export interface EnterpriseSystemConfig {
  serviceNow: ServiceNowConfig | null;
  jira: JiraConfig | null;
  workday: WorkdayConfig | null;
  leanIX: LeanIXConfig | null;
}

export interface ServiceNowConfig {
  instanceUrl: string;
  username: string;
  password: string;
  clientId?: string;
  clientSecret?: string;
  useOAuth: boolean;
}

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  cloudId?: string;
}

export interface WorkdayConfig {
  tenantUrl: string;
  username: string;
  password: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

export interface LeanIXConfig {
  instanceUrl: string;
  apiToken: string;
  workspaceId?: string;
}

// ===== DATA MODELS =====

export interface ServiceNowCMDBItem {
  sys_id: string;
  name: string;
  sys_class_name: string;
  asset_tag?: string;
  serial_number?: string;
  manufacturer?: string;
  model_id?: string;
  ip_address?: string;
  mac_address?: string;
  os?: string;
  os_version?: string;
  environment?: string;
  operational_status?: string;
  install_status?: string;
  owned_by?: string;
  managed_by?: string;
  supported_by?: string;
  location?: string;
  department?: string;
  cost_center?: string;
  sys_created_on?: string;
  sys_updated_on?: string;
}

export interface ServiceNowIncident {
  number: string;
  sys_id: string;
  short_description: string;
  description?: string;
  state: string;
  priority: string;
  impact: string;
  urgency: string;
  category?: string;
  subcategory?: string;
  assignment_group?: string;
  assigned_to?: string;
  caller_id?: string;
  opened_at?: string;
  resolved_at?: string;
  closed_at?: string;
  resolution_code?: string;
  close_notes?: string;
}

export interface ServiceNowUser {
  sys_id: string;
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  active: boolean;
  department?: string;
  title?: string;
  manager?: string;
  location?: string;
  cost_center?: string;
  employee_number?: string;
  last_login_time?: string;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  description?: string;
  projectTypeKey: string;
  lead?: string;
  url?: string;
  issueCount?: number;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description?: string;
  status: string;
  priority?: string;
  issueType: string;
  project: string;
  assignee?: string;
  reporter?: string;
  created: string;
  updated: string;
  resolved?: string;
  labels?: string[];
  components?: string[];
}

export interface WorkdayEmployee {
  workerId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  costCenter?: string;
  location?: string;
  manager?: string;
  hireDate?: string;
  terminationDate?: string;
  employeeType?: string;
  status: string;
}

export interface WorkdayCostCenter {
  id: string;
  name: string;
  code: string;
  active: boolean;
  manager?: string;
  parentCostCenter?: string;
  organization?: string;
}

export interface LeanIXFactSheet {
  id: string;
  name: string;
  type: string;
  description?: string;
  status?: string;
  lifecycle?: string;
  businessCriticality?: string;
  technicalFit?: string;
  functionalFit?: string;
  owner?: string;
  itOwner?: string;
  tags?: string[];
  relations?: LeanIXRelation[];
}

export interface LeanIXRelation {
  id: string;
  type: string;
  targetId: string;
  targetName: string;
  targetType: string;
}

// ===== EXTRACTION RESULTS =====

export interface EnterpriseExtractionResult {
  system: 'serviceNow' | 'jira' | 'workday' | 'leanIX';
  dataType: string;
  recordCount: number;
  data: any[];
  extractedAt: Date;
  status: 'success' | 'partial' | 'error';
  error?: string;
}

export interface EnterpriseSystemsState {
  configs: EnterpriseSystemConfig;
  connectionStatus: Record<string, 'disconnected' | 'connecting' | 'connected' | 'error'>;
  extractionResults: EnterpriseExtractionResult[];
  isExtracting: boolean;
  currentExtraction: string | null;
  progress: number;
  error: string | null;
}

// ===== MAIN HOOK =====

export const useEnterpriseSystemsLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  // State
  const [configs, setConfigs] = useState<EnterpriseSystemConfig>({
    serviceNow: null,
    jira: null,
    workday: null,
    leanIX: null,
  });

  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'disconnected' | 'connecting' | 'connected' | 'error'>>({
    serviceNow: 'disconnected',
    jira: 'disconnected',
    workday: 'disconnected',
    leanIX: 'disconnected',
  });

  const [extractionResults, setExtractionResults] = useState<EnterpriseExtractionResult[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [currentExtraction, setCurrentExtraction] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ===== CONFIGURATION HANDLERS =====

  const updateConfig = useCallback(<K extends keyof EnterpriseSystemConfig>(
    system: K,
    config: EnterpriseSystemConfig[K]
  ) => {
    setConfigs(prev => ({ ...prev, [system]: config }));
    setConnectionStatus(prev => ({ ...prev, [system]: 'disconnected' }));
  }, []);

  const clearConfig = useCallback((system: keyof EnterpriseSystemConfig) => {
    setConfigs(prev => ({ ...prev, [system]: null }));
    setConnectionStatus(prev => ({ ...prev, [system]: 'disconnected' }));
  }, []);

  // ===== CONNECTION TEST HANDLERS =====

  const testServiceNowConnection = useCallback(async (): Promise<boolean> => {
    if (!configs.serviceNow) return false;

    setConnectionStatus(prev => ({ ...prev, serviceNow: 'connecting' }));

    try {
      // Use Electron IPC to test ServiceNow connection
      const result = await window.electronAPI.invoke('enterprise-test-connection', {
        system: 'serviceNow',
        config: configs.serviceNow,
      });

      if (result.success) {
        setConnectionStatus(prev => ({ ...prev, serviceNow: 'connected' }));
        return true;
      } else {
        setConnectionStatus(prev => ({ ...prev, serviceNow: 'error' }));
        setError(result.error || 'ServiceNow connection failed');
        return false;
      }
    } catch (err: any) {
      setConnectionStatus(prev => ({ ...prev, serviceNow: 'error' }));
      setError(err.message || 'ServiceNow connection error');
      return false;
    }
  }, [configs.serviceNow]);

  const testJiraConnection = useCallback(async (): Promise<boolean> => {
    if (!configs.jira) return false;

    setConnectionStatus(prev => ({ ...prev, jira: 'connecting' }));

    try {
      const result = await window.electronAPI.invoke('enterprise-test-connection', {
        system: 'jira',
        config: configs.jira,
      });

      if (result.success) {
        setConnectionStatus(prev => ({ ...prev, jira: 'connected' }));
        return true;
      } else {
        setConnectionStatus(prev => ({ ...prev, jira: 'error' }));
        setError(result.error || 'Jira connection failed');
        return false;
      }
    } catch (err: any) {
      setConnectionStatus(prev => ({ ...prev, jira: 'error' }));
      setError(err.message || 'Jira connection error');
      return false;
    }
  }, [configs.jira]);

  const testWorkdayConnection = useCallback(async (): Promise<boolean> => {
    if (!configs.workday) return false;

    setConnectionStatus(prev => ({ ...prev, workday: 'connecting' }));

    try {
      const result = await window.electronAPI.invoke('enterprise-test-connection', {
        system: 'workday',
        config: configs.workday,
      });

      if (result.success) {
        setConnectionStatus(prev => ({ ...prev, workday: 'connected' }));
        return true;
      } else {
        setConnectionStatus(prev => ({ ...prev, workday: 'error' }));
        setError(result.error || 'Workday connection failed');
        return false;
      }
    } catch (err: any) {
      setConnectionStatus(prev => ({ ...prev, workday: 'error' }));
      setError(err.message || 'Workday connection error');
      return false;
    }
  }, [configs.workday]);

  const testLeanIXConnection = useCallback(async (): Promise<boolean> => {
    if (!configs.leanIX) return false;

    setConnectionStatus(prev => ({ ...prev, leanIX: 'connecting' }));

    try {
      const result = await window.electronAPI.invoke('enterprise-test-connection', {
        system: 'leanIX',
        config: configs.leanIX,
      });

      if (result.success) {
        setConnectionStatus(prev => ({ ...prev, leanIX: 'connected' }));
        return true;
      } else {
        setConnectionStatus(prev => ({ ...prev, leanIX: 'error' }));
        setError(result.error || 'LeanIX connection failed');
        return false;
      }
    } catch (err: any) {
      setConnectionStatus(prev => ({ ...prev, leanIX: 'error' }));
      setError(err.message || 'LeanIX connection error');
      return false;
    }
  }, [configs.leanIX]);

  // ===== DATA EXTRACTION HANDLERS =====

  const extractServiceNowData = useCallback(async (
    dataTypes: ('cmdb' | 'incidents' | 'users' | 'requests' | 'changes')[]
  ): Promise<EnterpriseExtractionResult[]> => {
    if (!configs.serviceNow || connectionStatus.serviceNow !== 'connected') {
      throw new Error('ServiceNow not connected');
    }

    setIsExtracting(true);
    setCurrentExtraction('ServiceNow');
    setProgress(0);

    const results: EnterpriseExtractionResult[] = [];

    try {
      for (let i = 0; i < dataTypes.length; i++) {
        const dataType = dataTypes[i];
        setProgress(((i + 0.5) / dataTypes.length) * 100);

        const result = await window.electronAPI.invoke('enterprise-extract-data', {
          system: 'serviceNow',
          config: configs.serviceNow,
          dataType,
          companyName: selectedSourceProfile?.companyName,
        });

        const extractionResult: EnterpriseExtractionResult = {
          system: 'serviceNow',
          dataType,
          recordCount: result.data?.length || 0,
          data: result.data || [],
          extractedAt: new Date(),
          status: result.success ? 'success' : 'error',
          error: result.error,
        };

        results.push(extractionResult);
        setExtractionResults(prev => [...prev, extractionResult]);
        setProgress(((i + 1) / dataTypes.length) * 100);
      }

      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsExtracting(false);
      setCurrentExtraction(null);
    }
  }, [configs.serviceNow, connectionStatus.serviceNow, selectedSourceProfile]);

  const extractJiraData = useCallback(async (
    dataTypes: ('projects' | 'issues' | 'users' | 'boards')[]
  ): Promise<EnterpriseExtractionResult[]> => {
    if (!configs.jira || connectionStatus.jira !== 'connected') {
      throw new Error('Jira not connected');
    }

    setIsExtracting(true);
    setCurrentExtraction('Jira');
    setProgress(0);

    const results: EnterpriseExtractionResult[] = [];

    try {
      for (let i = 0; i < dataTypes.length; i++) {
        const dataType = dataTypes[i];
        setProgress(((i + 0.5) / dataTypes.length) * 100);

        const result = await window.electronAPI.invoke('enterprise-extract-data', {
          system: 'jira',
          config: configs.jira,
          dataType,
          companyName: selectedSourceProfile?.companyName,
        });

        const extractionResult: EnterpriseExtractionResult = {
          system: 'jira',
          dataType,
          recordCount: result.data?.length || 0,
          data: result.data || [],
          extractedAt: new Date(),
          status: result.success ? 'success' : 'error',
          error: result.error,
        };

        results.push(extractionResult);
        setExtractionResults(prev => [...prev, extractionResult]);
        setProgress(((i + 1) / dataTypes.length) * 100);
      }

      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsExtracting(false);
      setCurrentExtraction(null);
    }
  }, [configs.jira, connectionStatus.jira, selectedSourceProfile]);

  const extractWorkdayData = useCallback(async (
    dataTypes: ('employees' | 'costCenters' | 'organizations' | 'positions')[]
  ): Promise<EnterpriseExtractionResult[]> => {
    if (!configs.workday || connectionStatus.workday !== 'connected') {
      throw new Error('Workday not connected');
    }

    setIsExtracting(true);
    setCurrentExtraction('Workday');
    setProgress(0);

    const results: EnterpriseExtractionResult[] = [];

    try {
      for (let i = 0; i < dataTypes.length; i++) {
        const dataType = dataTypes[i];
        setProgress(((i + 0.5) / dataTypes.length) * 100);

        const result = await window.electronAPI.invoke('enterprise-extract-data', {
          system: 'workday',
          config: configs.workday,
          dataType,
          companyName: selectedSourceProfile?.companyName,
        });

        const extractionResult: EnterpriseExtractionResult = {
          system: 'workday',
          dataType,
          recordCount: result.data?.length || 0,
          data: result.data || [],
          extractedAt: new Date(),
          status: result.success ? 'success' : 'error',
          error: result.error,
        };

        results.push(extractionResult);
        setExtractionResults(prev => [...prev, extractionResult]);
        setProgress(((i + 1) / dataTypes.length) * 100);
      }

      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsExtracting(false);
      setCurrentExtraction(null);
    }
  }, [configs.workday, connectionStatus.workday, selectedSourceProfile]);

  const extractLeanIXData = useCallback(async (
    factSheetTypes: ('Application' | 'ITComponent' | 'Interface' | 'DataObject' | 'BusinessCapability')[]
  ): Promise<EnterpriseExtractionResult[]> => {
    if (!configs.leanIX || connectionStatus.leanIX !== 'connected') {
      throw new Error('LeanIX not connected');
    }

    setIsExtracting(true);
    setCurrentExtraction('LeanIX');
    setProgress(0);

    const results: EnterpriseExtractionResult[] = [];

    try {
      for (let i = 0; i < factSheetTypes.length; i++) {
        const factSheetType = factSheetTypes[i];
        setProgress(((i + 0.5) / factSheetTypes.length) * 100);

        const result = await window.electronAPI.invoke('enterprise-extract-data', {
          system: 'leanIX',
          config: configs.leanIX,
          dataType: factSheetType,
          companyName: selectedSourceProfile?.companyName,
        });

        const extractionResult: EnterpriseExtractionResult = {
          system: 'leanIX',
          dataType: factSheetType,
          recordCount: result.data?.length || 0,
          data: result.data || [],
          extractedAt: new Date(),
          status: result.success ? 'success' : 'error',
          error: result.error,
        };

        results.push(extractionResult);
        setExtractionResults(prev => [...prev, extractionResult]);
        setProgress(((i + 1) / factSheetTypes.length) * 100);
      }

      return results;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsExtracting(false);
      setCurrentExtraction(null);
    }
  }, [configs.leanIX, connectionStatus.leanIX, selectedSourceProfile]);

  // ===== UTILITY FUNCTIONS =====

  const clearResults = useCallback(() => {
    setExtractionResults([]);
    setError(null);
  }, []);

  const exportResultsToCSV = useCallback(async (results: EnterpriseExtractionResult[]): Promise<string[]> => {
    const exportedFiles: string[] = [];

    for (const result of results) {
      if (result.data.length === 0) continue;

      const filename = `${result.system}_${result.dataType}_${new Date().toISOString().split('T')[0]}.csv`;

      try {
        const exportResult = await window.electronAPI.invoke('export-to-csv', {
          data: result.data,
          filename,
          companyName: selectedSourceProfile?.companyName,
        });

        if (exportResult.success) {
          exportedFiles.push(exportResult.path);
        }
      } catch (err) {
        console.error(`Failed to export ${filename}:`, err);
      }
    }

    return exportedFiles;
  }, [selectedSourceProfile]);

  // ===== COMPUTED VALUES =====

  const connectedSystems = useMemo(() => {
    return Object.entries(connectionStatus)
      .filter(([_, status]) => status === 'connected')
      .map(([system]) => system);
  }, [connectionStatus]);

  const totalExtractedRecords = useMemo(() => {
    return extractionResults.reduce((sum, result) => sum + result.recordCount, 0);
  }, [extractionResults]);

  const hasAnyConfig = useMemo(() => {
    return Object.values(configs).some(config => config !== null);
  }, [configs]);

  // ===== RETURN =====

  return {
    // State
    configs,
    connectionStatus,
    extractionResults,
    isExtracting,
    currentExtraction,
    progress,
    error,

    // Config Management
    updateConfig,
    clearConfig,

    // Connection Tests
    testServiceNowConnection,
    testJiraConnection,
    testWorkdayConnection,
    testLeanIXConnection,

    // Data Extraction
    extractServiceNowData,
    extractJiraData,
    extractWorkdayData,
    extractLeanIXData,

    // Utilities
    clearResults,
    exportResultsToCSV,

    // Computed
    connectedSystems,
    totalExtractedRecords,
    hasAnyConfig,
    selectedProfile: selectedSourceProfile,
  };
};

export default useEnterpriseSystemsLogic;
