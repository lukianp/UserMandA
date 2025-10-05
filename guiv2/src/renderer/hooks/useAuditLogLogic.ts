import { useState, useEffect } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';
import exportService from '../services/exportService';

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  category: string;
  severity: 'Critical' | 'Warning' | 'Info' | 'Success';
  details: string;
  ipAddress: string;
  success: boolean;
  duration?: number;
  resourceId?: string;
  resourceType?: string;
}

export const useAuditLogLogic = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateRange, setDateRange] = useState('week');
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    loadAuditLogs();
  }, [dateRange]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock audit logs
      const mockLogs: AuditLog[] = [];
      const actions = ['Login', 'Logout', 'Create', 'Update', 'Delete', 'Export', 'Import', 'Execute'];
      const categories = ['Authentication', 'User Management', 'Discovery', 'Migration', 'Reports', 'System'];
      const severities: AuditLog['severity'][] = ['Critical', 'Warning', 'Info', 'Success'];
      const users = ['admin', 'jsmith', 'mjones', 'rdavis'];

      for (let i = 0; i < 500; i++) {
        const timestamp = new Date();
        timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 168)); // Last week

        const action = actions[Math.floor(Math.random() * actions.length)];
        const success = Math.random() > 0.1; // 90% success rate

        mockLogs.push({
          id: `log-${i}`,
          timestamp,
          user: users[Math.floor(Math.random() * users.length)],
          action,
          category: categories[Math.floor(Math.random() * categories.length)],
          severity: success ? 'Success' : severities[Math.floor(Math.random() * 3)] as AuditLog['severity'],
          details: `${action} operation ${success ? 'completed successfully' : 'failed'}`,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          success,
          duration: Math.floor(Math.random() * 5000),
          resourceType: Math.random() > 0.5 ? 'User' : 'Project',
          resourceId: `res-${Math.floor(Math.random() * 1000)}`,
        });
      }

      // Sort by timestamp descending
      mockLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setAuditLogs(mockLogs);
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to load audit logs', pinned: false, priority: 'normal' });
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const filteredLogs = getFilteredLogs();
      await exportService.exportToExcel(filteredLogs, 'AuditLogs');
      addNotification({ type: 'success', message: `Exported ${filteredLogs.length} audit log entries`, pinned: false, priority: 'normal' });
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to export audit logs', pinned: false, priority: 'normal' });
    }
  };

  const handleRefresh = () => {
    loadAuditLogs();
    addNotification({ type: 'info', message: 'Audit logs refreshed', pinned: false, priority: 'low' });
  };

  const getFilteredLogs = () => {
    return auditLogs.filter(log => {
      const matchesSearch =
        searchQuery === '' ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAction = actionFilter === '' || log.action === actionFilter;
      const matchesSeverity = severityFilter === '' || log.severity === severityFilter;
      const matchesUser = userFilter === '' || log.user === userFilter;

      // Date range filtering
      const now = new Date();
      let matchesDate = true;

      if (dateRange === 'today') {
        matchesDate = log.timestamp.toDateString() === now.toDateString();
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = log.timestamp >= weekAgo;
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = log.timestamp >= monthAgo;
      } else if (dateRange === 'quarter') {
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        matchesDate = log.timestamp >= quarterAgo;
      }

      return matchesSearch && matchesAction && matchesSeverity && matchesUser && matchesDate;
    });
  };

  return {
    auditLogs: getFilteredLogs(),
    isLoading,
    searchQuery,
    actionFilter,
    severityFilter,
    userFilter,
    dateRange,
    setSearchQuery,
    setActionFilter,
    setSeverityFilter,
    setUserFilter,
    setDateRange,
    handleExport,
    handleRefresh,
  };
};
