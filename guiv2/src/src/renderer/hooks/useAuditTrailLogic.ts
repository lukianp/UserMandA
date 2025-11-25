import { useState, useCallback } from 'react';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'configuration' | 'system';
  status: 'success' | 'failure' | 'pending';
  correlationId?: string;
}

export interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: string;
  resourceType?: string;
  severity?: string;
  category?: string;
  status?: string;
}

export interface AuditTrailLogicReturn {
  events: AuditEvent[];
  filteredEvents: AuditEvent[];
  filters: AuditFilter;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  setFilters: (filters: AuditFilter) => void;
  clearFilters: () => void;
  loadEvents: (page?: number, pageSize?: number) => Promise<void>;
  exportEvents: (format: 'csv' | 'json' | 'pdf') => Promise<void>;
  searchEvents: (query: string) => Promise<void>;
  getEventDetails: (eventId: string) => Promise<AuditEvent | null>;
  refreshData: () => Promise<void>;
}

export function useAuditTrailLogic(): AuditTrailLogicReturn {
  const [events, setEvents] = useState<AuditEvent[]>([
    {
      id: 'event-1',
      timestamp: new Date('2025-01-15T10:30:00Z'),
      userId: 'user-123',
      userName: 'John Smith',
      action: 'login',
      resourceType: 'authentication',
      resourceId: 'session-456',
      resourceName: 'User Session',
      details: { method: 'password', success: true },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      severity: 'info',
      category: 'authentication',
      status: 'success',
    },
    {
      id: 'event-2',
      timestamp: new Date('2025-01-15T10:45:00Z'),
      userId: 'user-123',
      userName: 'John Smith',
      action: 'view_resource',
      resourceType: 'virtual_machine',
      resourceId: 'vm-789',
      resourceName: 'web-server-01',
      details: { viewType: 'details', duration: 120 },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      severity: 'info',
      category: 'data_access',
      status: 'success',
    },
    {
      id: 'event-3',
      timestamp: new Date('2025-01-15T11:00:00Z'),
      userId: 'user-456',
      userName: 'Jane Doe',
      action: 'failed_login',
      resourceType: 'authentication',
      resourceId: 'session-789',
      resourceName: 'User Session',
      details: { method: 'password', reason: 'invalid_credentials', attempts: 3 },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      severity: 'warning',
      category: 'authentication',
      status: 'failure',
    },
  ]);

  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>(events);
  const [filters, setFiltersState] = useState<AuditFilter>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(25);

  const totalCount = filteredEvents.length;

  const setFilters = useCallback((newFilters: AuditFilter) => {
    setFiltersState(newFilters);

    // Apply filters
    let filtered = events;

    if (newFilters.startDate) {
      filtered = filtered.filter(event => event.timestamp >= newFilters.startDate!);
    }
    if (newFilters.endDate) {
      filtered = filtered.filter(event => event.timestamp <= newFilters.endDate!);
    }
    if (newFilters.userId) {
      filtered = filtered.filter(event => event.userId === newFilters.userId);
    }
    if (newFilters.action) {
      filtered = filtered.filter(event => event.action === newFilters.action);
    }
    if (newFilters.resourceType) {
      filtered = filtered.filter(event => event.resourceType === newFilters.resourceType);
    }
    if (newFilters.severity) {
      filtered = filtered.filter(event => event.severity === newFilters.severity);
    }
    if (newFilters.category) {
      filtered = filtered.filter(event => event.category === newFilters.category);
    }
    if (newFilters.status) {
      filtered = filtered.filter(event => event.status === newFilters.status);
    }

    setFilteredEvents(filtered);
    setCurrentPage(1);
  }, [events]);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setFilteredEvents(events);
    setCurrentPage(1);
  }, [events]);

  const loadEvents = useCallback(async (page = 1, size = pageSize) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setCurrentPage(page);
      setPageSizeState(size);
    } catch (err) {
      setError('Failed to load audit events');
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  const exportEvents = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Audit events exported as ${format}`);
    } catch (err) {
      setError('Failed to export audit events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchEvents = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate search
      await new Promise(resolve => setTimeout(resolve, 300));

      const searchResults = events.filter(event =>
        (event.userName ?? '').toLowerCase().includes(query.toLowerCase()) ||
        (event.action ?? '').toLowerCase().includes(query.toLowerCase()) ||
        (event.resourceName ?? '').toLowerCase().includes(query.toLowerCase()) ||
        event.details.toString().toLowerCase().includes(query.toLowerCase())
      );

      setFilteredEvents(searchResults);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to search audit events');
    } finally {
      setIsLoading(false);
    }
  }, [events]);

  const getEventDetails = useCallback(async (eventId: string): Promise<AuditEvent | null> => {
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));

      return events.find(event => event.id === eventId) || null;
    } catch (err) {
      setError('Failed to get event details');
      return null;
    }
  }, [events]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock new events
      const newEvents: AuditEvent[] = [
        {
          id: `event-${Date.now()}`,
          timestamp: new Date(),
          userId: 'user-789',
          userName: 'Bob Wilson',
          action: 'create_resource',
          resourceType: 'storage_account',
          resourceId: `storage-${Date.now()}`,
          resourceName: 'new-storage-account',
          details: { size: '100GB', type: 'blob' },
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'info',
          category: 'data_access',
          status: 'success',
        },
      ];

      setEvents(prev => [...newEvents, ...prev]);
      setFilteredEvents(prev => [...newEvents, ...prev]);
    } catch (err) {
      setError('Failed to refresh audit data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    events,
    filteredEvents,
    filters,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    setFilters,
    clearFilters,
    loadEvents,
    exportEvents,
    searchEvents,
    getEventDetails,
    refreshData,
  };
}