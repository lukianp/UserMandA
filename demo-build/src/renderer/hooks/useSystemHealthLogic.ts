/**
 * useSystemHealthLogic Hook
 *
 * Manages system health monitoring with automatic polling.
 * Checks Logic Engine, PowerShell, and data connection status every 30 seconds.
 *
 * Epic 0: UI/UX Enhancement - Navigation & UX (TASK 6)
 *
 * @returns System health state and manual check function
 *
 * @example
 * ```tsx
 * const { systemStatus, checkHealth, isChecking } = useSystemHealthLogic();
 *
 * return (
 *   <SystemStatus indicators={systemStatus} />
 * );
 * ```
 */

import { useState, useEffect, useCallback } from 'react';

import type { SystemStatusIndicators } from '../components/molecules/SystemStatus';
import { getElectronAPI } from '../lib/electron-api-fallback';
import { useProfileStore } from '../store/useProfileStore';

/**
 * Health check interval (30 seconds)
 */
const HEALTH_CHECK_INTERVAL = 30000;

/**
 * Default system status (all services offline)
 */
const DEFAULT_STATUS: SystemStatusIndicators = {
  logicEngine: 'offline',
  powerShell: 'offline',
  dataConnection: 'offline',
  lastSync: undefined,
};

/**
 * useSystemHealthLogic Hook
 */
export const useSystemHealthLogic = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatusIndicators>(DEFAULT_STATUS);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get profile connection status from store
  const profileConnectionStatus = useProfileStore((state) => state.connectionStatus);

  /**
   * Check system health status
   */
  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    setError(null);

    try {
      // Get electronAPI with fallback
      const electronAPI = getElectronAPI();

      // Call dashboard service to get system health
      const healthResult = await electronAPI.dashboard.getSystemHealth();

      if (healthResult.success && healthResult.data) {
        const health = healthResult.data;

        // Extract status from health objects (they may be objects with {status, lastCheck, responseTimeMs})
        const extractStatus = (statusObj: any): 'online' | 'offline' | 'degraded' => {
          if (typeof statusObj === 'string') return statusObj as any;
          if (statusObj && typeof statusObj === 'object' && statusObj.status) {
            return statusObj.status;
          }
          return 'offline';
        };

        // Map health data to status indicators
        setSystemStatus({
          logicEngine: extractStatus(health.logicEngineStatus),
          powerShell: extractStatus(health.powerShellStatus),
          dataConnection: determineDataConnectionStatus(),
          lastSync: new Date().toISOString(),
        });
      } else {
        // Health check failed, set degraded status
        // But preserve dataConnection status from profile connection test
        console.warn('Health check returned no data:', healthResult.error);
        setSystemStatus((prev) => ({
          logicEngine: 'degraded',
          powerShell: 'degraded',
          dataConnection: determineDataConnectionStatus(),
          lastSync: prev.lastSync, // Keep previous sync time
        }));
        setError(healthResult.error || 'Health check failed');
      }
    } catch (err) {
      // Exception during health check
      // But preserve dataConnection status from profile connection test
      console.error('Health check exception:', err);
      setSystemStatus((prev) => ({
        logicEngine: 'degraded',
        powerShell: 'degraded',
        dataConnection: determineDataConnectionStatus(),
        lastSync: prev.lastSync, // Keep previous sync time
      }));
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsChecking(false);
    }
  }, []); // No dependencies - use functional updates for state

  /**
   * Determine data connection status based on credential test results
   * Only shows 'online' after a successful test connection to Azure/on-premises
   */
  const determineDataConnectionStatus = (): 'online' | 'offline' | 'degraded' => {
    // Map profile connection status to system status indicator
    switch (profileConnectionStatus) {
      case 'connected':
        return 'online';
      case 'connecting':
        return 'degraded';
      case 'error':
        return 'degraded';
      case 'disconnected':
      default:
        return 'offline';
    }
  };

  /**
   * Initialize health check on mount and set up polling interval
   */
  useEffect(() => {
    // Initial health check
    checkHealth();

    // Set up polling interval
    const interval = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []); // Empty deps - checkHealth is stable now

  /**
   * Update data connection status when profile connection status changes
   * This ensures the "Data Connection" indicator reflects credential test results
   */
  useEffect(() => {
    setSystemStatus((prev) => ({
      ...prev,
      dataConnection: determineDataConnectionStatus(),
    }));
  }, [profileConnectionStatus]); // Only depend on profileConnectionStatus, not the function itself

  return {
    systemStatus,
    isChecking,
    error,
    checkHealth,
  };
};

export default useSystemHealthLogic;


