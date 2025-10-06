/**
 * useDashboardLogic Hook
 *
 * Manages dashboard data loading, auto-refresh, and real-time updates.
 * Integrates with Logic Engine via dashboard service APIs.
 *
 * Phase 5: Dashboard Frontend Implementation
 */

import { useState, useEffect, useCallback } from 'react';
import type { DashboardStats, ProjectTimeline, SystemHealth, ActivityItem } from '../types/dashboard';

interface UseDashboardLogicReturn {
  stats: DashboardStats | null;
  project: ProjectTimeline | null;
  health: SystemHealth | null;
  activity: ActivityItem[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
}

/**
 * Dashboard logic hook with auto-refresh
 *
 * Features:
 * - Loads all dashboard data on mount
 * - Auto-refreshes every 30 seconds
 * - Handles errors gracefully
 * - Provides manual reload function
 * - Alert acknowledgment
 *
 * @returns Dashboard state and actions
 */
export const useDashboardLogic = (): UseDashboardLogicReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [project, setProject] = useState<ProjectTimeline | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all dashboard data from backend services
   */
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Parallel fetch all dashboard components
      const [statsResult, projectResult, healthResult, activityResult] = await Promise.all([
        window.electronAPI.dashboard.getStats(),
        window.electronAPI.dashboard.getProjectTimeline(),
        window.electronAPI.dashboard.getSystemHealth(),
        window.electronAPI.dashboard.getRecentActivity(10)
      ]);

      // Update state with fetched data
      setStats(statsResult);
      setProject(projectResult);
      setHealth(healthResult);
      setActivity(activityResult);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Acknowledge a system alert
   */
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await window.electronAPI.dashboard.acknowledgeAlert(alertId);
      // Refresh health data to update alert list
      await loadDashboardData();
    } catch (err: any) {
      console.error('Failed to acknowledge alert:', err);
    }
  }, [loadDashboardData]);

  /**
   * Initial load on mount
   */
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  /**
   * Auto-refresh every 30 seconds
   */
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loadDashboardData]);

  return {
    stats,
    project,
    health,
    activity,
    isLoading,
    error,
    reload: loadDashboardData,
    acknowledgeAlert
  };
};

export default useDashboardLogic;
