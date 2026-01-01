/**
 * Security Audit Logic Hook
 * Handles security audit log viewing and analysis
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';

import { useProfileStore } from '../store/useProfileStore';

export interface SecurityAuditEvent {
  id: string;
  timestamp: Date | string;
  eventCategory: 'Authentication' | 'Authorization' | 'DataAccess' | 'Configuration' | 'Security' | 'System';
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  eventType: string;
  user: string;
  resource: string;
  action: string;
  result: 'Success' | 'Failure' | 'Warning';
  sourceIP: string;
  sourceLocation: string;
  targetResource: string;
  details: string;
  correlationId: string;
}

export interface SecurityAuditFilters {
  eventCategory: string;
  severity: string;
  user: string;
  resource: string;
  result: string;
  dateFrom: string;
  dateTo: string;
  searchText: string;
}

export const useSecurityAuditLogic = () => {
  const { selectedSourceProfile } = useProfileStore();

  // Data state
  const [data, setData] = useState<SecurityAuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<SecurityAuditFilters>({
    eventCategory: '',
    severity: '',
    user: '',
    resource: '',
    result: '',
    dateFrom: '',
    dateTo: '',
    searchText: '',
  });

  // Selection state
  const [selectedEvents, setSelectedEvents] = useState<SecurityAuditEvent[]>([]);

  // Column definitions
  const columns = useMemo<ColDef<SecurityAuditEvent>[]>(
    () => [
      {
        headerName: 'Timestamp',
        field: 'timestamp',
        pinned: 'left',
        width: 180,
        valueFormatter: (params) => {
          if (!params.value) return '';
          return new Date(params.value).toLocaleString();
        },
        sort: 'desc',
      },
      {
        headerName: 'Severity',
        field: 'severity',
        width: 100,
        cellRenderer: (params: any) => {
          const colorMap = {
            Critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            Info: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          };
          const color = colorMap[params.value as keyof typeof colorMap] || '';
          return `<span class="px-2 py-1 rounded text-xs font-semibold ${color}">${params.value}</span>`;
        },
      },
      {
        headerName: 'Category',
        field: 'eventCategory',
        width: 150,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Event Type',
        field: 'eventType',
        width: 180,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'User',
        field: 'user',
        width: 180,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Action',
        field: 'action',
        width: 150,
      },
      {
        headerName: 'Resource',
        field: 'resource',
        width: 200,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Result',
        field: 'result',
        width: 100,
        cellRenderer: (params: any) => {
          const colorMap = {
            Success: 'text-green-600',
            Failure: 'text-red-600',
            Warning: 'text-yellow-600',
          };
          const color = colorMap[params.value as keyof typeof colorMap] || 'text-gray-600';
          return `<span class="${color} font-semibold">${params.value}</span>`;
        },
      },
      {
        headerName: 'Source IP',
        field: 'sourceIP',
        width: 140,
      },
      {
        headerName: 'Source Location',
        field: 'sourceLocation',
        width: 150,
      },
      {
        headerName: 'Target Resource',
        field: 'targetResource',
        width: 200,
      },
      {
        headerName: 'Details',
        field: 'details',
        width: 300,
        wrapText: true,
        autoHeight: false,
      },
      {
        headerName: 'Correlation ID',
        field: 'correlationId',
        width: 180,
      },
    ],
    []
  );

  // Filtered data
  const filteredData = useMemo(() => {
    let result = [...data];

    if (filters.eventCategory) {
      result = result.filter((item) => item.eventCategory === filters.eventCategory);
    }

    if (filters.severity) {
      result = result.filter((item) => item.severity === filters.severity);
    }

    if (filters.user) {
      result = result.filter((item) => (item.user ?? '').toLowerCase().includes(filters.user.toLowerCase()));
    }

    if (filters.resource) {
      result = result.filter((item) =>
        (item.resource ?? '').toLowerCase().includes(filters.resource.toLowerCase())
      );
    }

    if (filters.result) {
      result = result.filter((item) => item.result === filters.result);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter((item) => new Date(item.timestamp) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((item) => new Date(item.timestamp) <= toDate);
    }

    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      result = result.filter(
        (item) =>
          (item.eventType ?? '').toLowerCase().includes(search) ||
          (item.user ?? '').toLowerCase().includes(search) ||
          (item.action ?? '').toLowerCase().includes(search) ||
          (item.details ?? '').toLowerCase().includes(search)
      );
    }

    return result;
  }, [data, filters]);

  // Filter options
  const filterOptions = useMemo(() => {
    const categories = ['Authentication', 'Authorization', 'DataAccess', 'Configuration', 'Security', 'System'];
    const severities = ['Critical', 'High', 'Medium', 'Low', 'Info'];
    const results = ['Success', 'Failure', 'Warning'];

    return { categories, severities, results };
  }, []);

  // Load data
  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) {
      setError('No source profile selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Security/AuditLog.psm1',
        functionName: 'Get-SecurityAuditEvents',
        parameters: {
          Domain: selectedSourceProfile.domain,
          Credential: selectedSourceProfile.credential,
          StartDate: filters.dateFrom || null,
          EndDate: filters.dateTo || null,
        },
        options: {
          timeout: 300000, // 5 minutes
        },
      });

      if (result.success && result.data) {
        setData(result.data.events || []);
      } else {
        throw new Error(result.error || 'Failed to load security audit events');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile, filters.dateFrom, filters.dateTo]);

  // Toggle live mode
  const toggleLiveMode = useCallback(() => {
    setIsLiveMode((prev) => !prev);
  }, []);

  // Update filter
  const updateFilter = useCallback(
    <K extends keyof SecurityAuditFilters>(key: K, value: SecurityAuditFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      eventCategory: '',
      severity: '',
      user: '',
      resource: '',
      result: '',
      dateFrom: '',
      dateTo: '',
      searchText: '',
    });
  }, []);

  // Export data
  const exportData = useCallback(
    async (format: 'csv' | 'json' | 'siem') => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `security-audit-${timestamp}.${format}`;

      if (format === 'siem') {
        // Export in CEF (Common Event Format) for SIEM systems
        const cefData = filteredData.map((event) => {
          return `CEF:0|MandA|Discovery|1.0|${event.eventType}|${event.action}|${
            event.severity === 'Critical' ? 10 : event.severity === 'High' ? 8 : event.severity === 'Medium' ? 5 : 3
          }|src=${event.sourceIP} suser=${event.user} cs1=${event.resource} cs2=${event.details}`;
        });
        return { filename: `security-audit-${timestamp}.cef`, data: cefData.join('\n') };
      }

      return { filename, data: filteredData };
    },
    [filteredData]
  );

  // Statistics
  const stats = useMemo(() => {
    const total = filteredData.length;
    const critical = filteredData.filter((e) => e.severity === 'Critical').length;
    const high = filteredData.filter((e) => e.severity === 'High').length;
    const failures = filteredData.filter((e) => e.result === 'Failure').length;
    const authEvents = filteredData.filter((e) => e.eventCategory === 'Authentication').length;
    const securityEvents = filteredData.filter((e) => e.eventCategory === 'Security').length;

    return {
      total,
      critical,
      high,
      failures,
      authEvents,
      securityEvents,
    };
  }, [filteredData]);

  // Event timeline data
  const timelineData = useMemo(() => {
    const hourCounts: Record<string, number> = {};

    filteredData.forEach((event) => {
      const date = new Date(event.timestamp);
      const hourKey = `${date.getHours()}:00`;
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [filteredData]);

  // Live mode polling
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      loadData();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [isLiveMode, loadData]);

  // Load data on mount
  useEffect(() => {
    if (selectedSourceProfile) {
      loadData();
    }
  }, [selectedSourceProfile, loadData]);

  return {
    // Data
    data: filteredData,
    columns,
    isLoading,
    isLiveMode,
    error,

    // Filters
    filters,
    filterOptions,
    updateFilter,
    clearFilters,

    // Selection
    selectedEvents,
    setSelectedEvents,

    // Actions
    loadData,
    toggleLiveMode,
    exportData,

    // Statistics
    stats,
    timelineData,

    // Profile
    selectedProfile: selectedSourceProfile,
  };
};


