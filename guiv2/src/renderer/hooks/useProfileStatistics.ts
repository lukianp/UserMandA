/**
 * Profile Statistics Hook
 *
 * Replicates /gui/ ProfileService.GetProfileStatisticsAsync pattern:
 * - LastDiscoveryRun time
 * - TotalDiscoveryRuns count
 * - DataSizeBytes
 * - Entity counts (users, groups, computers, etc.)
 * - Data health status
 *
 * Usage:
 * ```typescript
 * const { statistics, isLoading, refresh } = useProfileStatistics(profileId);
 * ```
 */

import { useState, useEffect, useCallback } from 'react';

import { useProfileStore } from '../store/useProfileStore';

export interface ProfileStatistics {
  profileId: string;
  companyName: string;
  lastDiscoveryRun: Date | null;
  totalDiscoveryRuns: number;
  dataSizeBytes: number;
  dataSizeMB: number;
  userCount: number;
  groupCount: number;
  computerCount: number;
  applicationCount: number;
  hasData: boolean;
  dataHealth: 'healthy' | 'warning' | 'error' | 'unknown';
  healthMessage: string;
  lastModified: Date | null;
  csvFiles: {
    name: string;
    size: number;
    lastModified: Date;
  }[];
}

/**
 * Hook to get profile statistics
 *
 * @param profileId - Profile ID to get statistics for (optional, defaults to current profile)
 * @returns Profile statistics, loading state, and refresh function
 */
export function useProfileStatistics(profileId?: string) {
  const [statistics, setStatistics] = useState<ProfileStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const effectiveProfileId = profileId || selectedSourceProfile?.id;

  /**
   * Load profile statistics
   * Replicates /gui/ ProfileService.GetProfileStatisticsAsync
   */
  const loadStatistics = useCallback(async () => {
    if (!effectiveProfileId) {
      setStatistics(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`[ProfileStatistics] Loading statistics for profile: ${effectiveProfileId}`);

      // Get profile data path
      const dataPathResult = await window.electronAPI.getProfileDataPath(effectiveProfileId) as { success: boolean; error?: string; dataPath: string };

      if (!dataPathResult.success) {
        throw new Error(dataPathResult.error || 'Failed to get profile data path');
      }

      const profileDataPath = dataPathResult.dataPath;
      const rawPath = `${profileDataPath}\\Raw`;

      // Get LogicEngine statistics
      const logicEngineStats = await window.electronAPI.invoke('logicEngine:getAllUsers');
      const groupsResult = await window.electronAPI.invoke('logicEngine:getAllGroups');
      const devicesResult = await window.electronAPI.invoke('logicEngine:getAllDevices');
      const appsResult = await window.electronAPI.invoke('logicEngine:getAllApplications');

      const userCount = logicEngineStats.success && logicEngineStats.data ? logicEngineStats.data.length : 0;
      const groupCount = groupsResult.success && groupsResult.data ? groupsResult.data.length : 0;
      const computerCount = devicesResult.success && devicesResult.data ? devicesResult.data.length : 0;
      const applicationCount = appsResult.success && appsResult.data ? appsResult.data.length : 0;

      // Get CSV files in Raw directory
      const csvFiles: { name: string; size: number; lastModified: Date }[] = [];
      let totalSize = 0;
      let latestModified: Date | null = null;

      try {
        const files = await window.electronAPI.listFiles(rawPath, '*.csv');

        for (const filePath of files) {
          const stats = await window.electronAPI.invoke('file:stat', filePath);

          if (stats && stats.isFile) {
            const fileInfo = {
              name: filePath.split('\\').pop() || filePath,
              size: stats.size || 0,
              lastModified: new Date(stats.modified),
            };

            csvFiles.push(fileInfo);
            totalSize += fileInfo.size;

            if (!latestModified || fileInfo.lastModified > latestModified) {
              latestModified = fileInfo.lastModified;
            }
          }
        }
      } catch (err) {
        console.warn('[ProfileStatistics] Failed to read CSV files:', err);
      }

      // Determine data health
      let dataHealth: 'healthy' | 'warning' | 'error' | 'unknown' = 'unknown';
      let healthMessage = 'No data available';

      if (csvFiles.length === 0) {
        dataHealth = 'error';
        healthMessage = 'No CSV files found in Raw directory';
      } else if (userCount === 0 && groupCount === 0 && computerCount === 0) {
        dataHealth = 'warning';
        healthMessage = 'CSV files exist but LogicEngine has no data loaded';
      } else if (latestModified && (Date.now() - latestModified.getTime()) > 7 * 24 * 60 * 60 * 1000) {
        dataHealth = 'warning';
        healthMessage = 'Data is older than 7 days - consider running discovery';
      } else {
        dataHealth = 'healthy';
        healthMessage = `${userCount + groupCount + computerCount + applicationCount} entities loaded`;
      }

      const stats: ProfileStatistics = {
        profileId: effectiveProfileId,
        companyName: selectedSourceProfile?.companyName || 'Unknown',
        lastDiscoveryRun: latestModified,
        totalDiscoveryRuns: csvFiles.length > 0 ? 1 : 0, // Simplified - would need log file analysis for exact count
        dataSizeBytes: totalSize,
        dataSizeMB: Math.round((totalSize / 1024 / 1024) * 100) / 100,
        userCount,
        groupCount,
        computerCount,
        applicationCount,
        hasData: csvFiles.length > 0,
        dataHealth,
        healthMessage,
        lastModified: latestModified,
        csvFiles,
      };

      setStatistics(stats);
      setError(null);

      console.log('[ProfileStatistics] Statistics loaded:', stats);

    } catch (err) {
      console.error('[ProfileStatistics] Failed to load statistics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile statistics');
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveProfileId, selectedSourceProfile]);

  // Load statistics when profile changes
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return {
    statistics,
    isLoading,
    error,
    refresh: loadStatistics,
  };
}
