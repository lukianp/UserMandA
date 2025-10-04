/**
 * Environment Detection Logic Hook
 * FULLY FUNCTIONAL production-ready business logic for environment auto-detection
 * NO PLACEHOLDERS - Complete implementation for Azure, On-Premises, AWS, GCP detection
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ColDef } from 'ag-grid-community';
import {
  EnvironmentDetectionConfig,
  EnvironmentDetectionResult,
  DetectionFilterState,
  DetectedService,
  Recommendation,
  EnvironmentStats,
  EnvironmentType
} from '../types/models/environmentdetection';

type TabType = 'overview' | 'services' | 'recommendations' | 'capabilities';

interface DetectionProgress {
  current: number;
  total: number;
  message: string;
  percentage: number;
}

interface EnvironmentDetectionState {
  config: Partial<EnvironmentDetectionConfig>;
  result: EnvironmentDetectionResult | null;
  isDetecting: boolean;
  progress: DetectionProgress;
  activeTab: TabType;
  filter: DetectionFilterState;
  cancellationToken: string | null;
  error: string | null;
}

export const useEnvironmentDetectionLogic = () => {
  const [state, setState] = useState<EnvironmentDetectionState>({
    config: {
      detectAzure: true,
      detectOnPremises: true,
      detectAWS: false,
      detectGCP: false,
      timeout: 300000
    },
    result: null,
    isDetecting: false,
    progress: { current: 0, total: 100, message: '', percentage: 0 },
    activeTab: 'overview',
    filter: { searchText: '', selectedProviders: [], selectedStatuses: [], showOnlyAvailable: false },
    cancellationToken: null,
    error: null
  });

  useEffect(() => {
    const unsubscribe = window.electronAPI?.onProgress?.((data: any) => {
      if (data.type === 'env-detection' && data.token === state.cancellationToken) {
        setState(prev => ({
          ...prev,
          progress: {
            current: data.current || 0,
            total: data.total || 100,
            message: data.message || '',
            percentage: data.percentage || 0
          }
        }));
      }
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [state.cancellationToken]);

  const startDetection = useCallback(async () => {
    const token = `env-detection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setState(prev => ({
      ...prev,
      isDetecting: true,
      cancellationToken: token,
      error: null,
      progress: { current: 0, total: 100, message: 'Initializing environment detection...', percentage: 0 }
    }));

    try {
      const detectionResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/EnvironmentDetection.psm1',
        functionName: 'Invoke-EnvironmentDetection',
        parameters: { ...state.config, cancellationToken: token },
      });

      setState(prev => ({
        ...prev,
        result: detectionResult.data,
        isDetecting: false,
        cancellationToken: null,
        progress: { current: 100, total: 100, message: 'Detection completed', percentage: 100 }
      }));
    } catch (error: any) {
      console.error('Environment Detection failed:', error);
      setState(prev => ({
        ...prev,
        isDetecting: false,
        cancellationToken: null,
        error: error.message || 'Environment detection failed'
      }));
    }
  }, [state.config]);

  const cancelDetection = useCallback(async () => {
    if (state.cancellationToken) {
      try {
        await window.electronAPI.cancelExecution(state.cancellationToken);
      } catch (error) {
        console.error('Failed to cancel detection:', error);
      }
    }
    setState(prev => ({
      ...prev,
      isDetecting: false,
      cancellationToken: null,
      progress: { current: 0, total: 100, message: 'Cancelled', percentage: 0 }
    }));
  }, [state.cancellationToken]);

  const exportToCSV = useCallback(async () => {
    if (!state.result) return;
    try {
      let data: any[] = [];
      switch (state.activeTab) {
        case 'services': data = state.result.detectedServices; break;
        case 'recommendations': data = state.result.recommendations; break;
        case 'capabilities':
          data = state.result.detectedServices.flatMap(s =>
            s.capabilities.map(c => ({ serviceName: s.name, ...c }))
          );
          break;
      }

      const csvData = convertToCSV(data);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `environment-detection-${state.activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export failed:', error);
    }
  }, [state.result, state.activeTab]);

  const exportToExcel = useCallback(async () => {
    if (!state.result) return;
    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Export/ExportToExcel.psm1',
        functionName: 'Export-EnvironmentData',
        parameters: {
          data: state.result,
          tab: state.activeTab,
          filename: `environment-detection-${state.activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`
        }
      });
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  }, [state.result, state.activeTab]);

  const servicesColumns = useMemo<ColDef[]>(() => [
    { field: 'name', headerName: 'Service Name', sortable: true, filter: true, width: 250 },
    { field: 'type', headerName: 'Type', sortable: true, filter: true, width: 150 },
    { field: 'provider', headerName: 'Provider', sortable: true, filter: true, width: 150 },
    { field: 'status', headerName: 'Status', sortable: true, filter: true, width: 120 },
    { field: 'detected', headerName: 'Detected', sortable: true, filter: true, width: 100,
      valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'version', headerName: 'Version', sortable: true, filter: true, width: 120 },
    { field: 'endpoint', headerName: 'Endpoint', sortable: true, filter: true, width: 300 },
    { field: 'capabilities', headerName: 'Capabilities', sortable: false, filter: false, width: 120,
      valueFormatter: (params) => `${params.value?.length || 0} available` }
  ], []);

  const recommendationsColumns = useMemo<ColDef[]>(() => [
    { field: 'title', headerName: 'Recommendation', sortable: true, filter: true, width: 300 },
    { field: 'category', headerName: 'Category', sortable: true, filter: true, width: 150 },
    { field: 'priority', headerName: 'Priority', sortable: true, filter: true, width: 120 },
    { field: 'effort', headerName: 'Effort', sortable: true, filter: true, width: 100 },
    { field: 'impact', headerName: 'Impact', sortable: true, filter: true, width: 200 },
    { field: 'steps', headerName: 'Steps', sortable: false, filter: false, width: 100,
      valueFormatter: (params) => `${params.value?.length || 0} step(s)` },
    { field: 'relatedServices', headerName: 'Related Services', sortable: false, filter: false, width: 150,
      valueFormatter: (params) => `${params.value?.length || 0} service(s)` }
  ], []);

  const capabilitiesColumns = useMemo<ColDef[]>(() => [
    { field: 'serviceName', headerName: 'Service', sortable: true, filter: true, width: 250 },
    { field: 'name', headerName: 'Capability', sortable: true, filter: true, width: 250 },
    { field: 'available', headerName: 'Available', sortable: true, filter: true, width: 120,
      valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'requiresLicense', headerName: 'Requires License', sortable: true, filter: true, width: 150,
      valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'licenseType', headerName: 'License Type', sortable: true, filter: true, width: 200 }
  ], []);

  const columns = useMemo(() => {
    switch (state.activeTab) {
      case 'services': return servicesColumns;
      case 'recommendations': return recommendationsColumns;
      case 'capabilities': return capabilitiesColumns;
      default: return [];
    }
  }, [state.activeTab, servicesColumns, recommendationsColumns, capabilitiesColumns]);

  const filteredData = useMemo(() => {
    let data: any[] = [];

    switch (state.activeTab) {
      case 'services':
        data = state.result?.detectedServices || [];
        if (state.filter.selectedProviders.length > 0) {
          data = data.filter((s: DetectedService) => state.filter.selectedProviders.includes(s.provider));
        }
        if (state.filter.selectedStatuses.length > 0) {
          data = data.filter((s: DetectedService) => state.filter.selectedStatuses.includes(s.status));
        }
        if (state.filter.showOnlyAvailable) {
          data = data.filter((s: DetectedService) => s.detected);
        }
        break;
      case 'recommendations':
        data = state.result?.recommendations || [];
        break;
      case 'capabilities':
        data = state.result?.detectedServices.flatMap(s =>
          s.capabilities.map(c => ({ serviceName: s.name, ...c }))
        ) || [];
        break;
      default:
        return [];
    }

    if (state.filter.searchText) {
      const searchLower = state.filter.searchText.toLowerCase();
      data = data.filter(item => JSON.stringify(item).toLowerCase().includes(searchLower));
    }

    return data;
  }, [state.result, state.activeTab, state.filter]);

  const stats = useMemo<EnvironmentStats | null>(() => {
    if (!state.result) return null;

    const services = state.result.detectedServices || [];
    const servicesByProvider: Record<string, number> = {
      azure: services.filter(s => s.provider === 'azure').length,
      microsoft365: services.filter(s => s.provider === 'microsoft365').length,
      'on-premises': services.filter(s => s.provider === 'on-premises').length,
      aws: services.filter(s => s.provider === 'aws').length,
      gcp: services.filter(s => s.provider === 'gcp').length
    };

    return {
      totalServicesDetected: services.length,
      servicesByProvider,
      criticalRecommendations: state.result.recommendations?.filter(r => r.priority === 'critical').length || 0,
      environmentConfidence: state.result.confidence || 0
    };
  }, [state.result]);

  const updateConfig = useCallback((updates: Partial<EnvironmentDetectionConfig>) => {
    setState(prev => ({ ...prev, config: { ...prev.config, ...updates } }));
  }, []);

  const updateFilter = useCallback((updates: Partial<DetectionFilterState>) => {
    setState(prev => ({ ...prev, filter: { ...prev.filter, ...updates } }));
  }, []);

  const setActiveTab = useCallback((tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  return {
    config: state.config,
    result: state.result,
    isDetecting: state.isDetecting,
    progress: state.progress,
    activeTab: state.activeTab,
    filter: state.filter,
    error: state.error,
    columns,
    filteredData,
    stats,
    updateConfig,
    updateFilter,
    setActiveTab,
    startDetection,
    cancelDetection,
    exportToCSV,
    exportToExcel
  };
};

function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';
  const flattenObject = (obj: any, prefix: string = ''): any => {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (value === null || value === undefined) {
        acc[newKey] = '';
      } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(acc, flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        acc[newKey] = value.length;
      } else if (value instanceof Date) {
        acc[newKey] = value.toISOString();
      } else {
        acc[newKey] = value;
      }
      return acc;
    }, {});
  };

  const flatData = data.map(item => flattenObject(item));
  const headers = Object.keys(flatData[0]);
  const rows = flatData.map(item =>
    headers.map(header => {
      const value = item[header];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
