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
import { getElectronAPI } from '../lib/electron-api-fallback';

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

      // Get electronAPI with fallback
      const electronAPI = getElectronAPI();

      // Parallel fetch all dashboard components
      const [statsResult, projectResult, healthResult, activityResult] = await Promise.all([
        electronAPI.dashboard.getStats(),
        electronAPI.dashboard.getProjectTimeline(),
        electronAPI.dashboard.getSystemHealth(),
        electronAPI.dashboard.getRecentActivity(10)
      ]);

      // Update state with fetched data
      setStats(statsResult?.success ? statsResult.data : statsResult);
      setProject(projectResult?.success ? projectResult.data : projectResult);
      setHealth(healthResult?.success ? healthResult.data : healthResult);

      // Handle activityResult which can be array or response object
      if (Array.isArray(activityResult)) {
        setActivity(activityResult);
      } else if (activityResult && typeof activityResult === 'object' && 'success' in activityResult) {
        setActivity(activityResult.success ? activityResult.data : []);
      } else {
        setActivity([]);
      }
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
      const electronAPI = getElectronAPI();
      await electronAPI.dashboard.acknowledgeAlert(alertId);
      // Refresh health data to update alert list
      await loadDashboardData();
    } catch (err: any) {
      console.error('Failed to acknowledge alert:', err);
    }
  }, []); // loadDashboardData is stable, no need to include

  /**
   * Initial load and auto-refresh setup
   */
  useEffect(() => {
    // Initial load
    loadDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run on mount

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
