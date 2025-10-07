/**
 * User Detail Logic Hook
 *
 * Manages data loading, caching, and actions for UserDetailView.
 * Mirrors C# UserDetailViewModel.cs business logic (lines 34-196).
 *
 * Epic 1 Task 1.2: UserDetailView Component
 */

import { useState, useEffect, useCallback } from 'react';
import type { UserDetailProjection } from '../types/models/userDetail';
import { useTabStore } from '../store/useTabStore';
import { useModalStore } from '../store/useModalStore';
import { useMigrationStore } from '../store/useMigrationStore';
import { useNotificationStore } from '../store/useNotificationStore';

export interface UseUserDetailLogicResult {
  // State
  userDetail: UserDetailProjection | null;
  isLoading: boolean;
  error: string | null;
  loadingMessage: string;
  selectedTab: number;

  // Actions
  setSelectedTab: (index: number) => void;
  refreshData: () => Promise<void>;
  addToMigrationWave: () => void;
  exportSnapshot: (format: 'json' | 'csv') => Promise<void>;
  closeView: () => void;
}

/**
 * User Detail Logic Hook
 *
 * @param userId - User identifier (SID or UPN)
 * @returns User detail state and actions
 */
export function useUserDetailLogic(userId: string): UseUserDetailLogicResult {
  // State
  const [userDetail, setUserDetail] = useState<UserDetailProjection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing...');
  const [selectedTab, setSelectedTab] = useState<number>(0); // 0-8 for 9 tabs

  // Store access
  const closeTab = useTabStore((state) => state.closeTab);
  const selectedTabId = useTabStore((state) => state.selectedTabId);
  const openModal = useModalStore((state) => state.openModal);
  const addItemToWave = useMigrationStore((state) => state.addItemToWave);
  const showNotification = useNotificationStore((state) => state.addNotification);

  /**
   * Load user detail from LogicEngineService via IPC
   * Mirrors C# LoadUserDetailAsync (lines 141-166)
   * Updated for Epic 4: Uses Logic Engine API
   */
  const loadUserDetail = useCallback(async () => {
    if (!userId) {
      setError('No user identifier provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setLoadingMessage('Loading user data from LogicEngine...');

      // Epic 4: Use new Logic Engine API
      const result = await window.electronAPI.logicEngine.getUserDetail(userId);

      if (!result || !result.success) {
        throw new Error(result?.error || 'User not found');
      }

      setUserDetail(result.data);
      setLoadingMessage('');

      showNotification({
        type: 'success',
        title: 'User Details Loaded',
        message: `Loaded details for ${result.data?.user?.displayName || userId}`,
        priority: 'normal',
        pinned: false,
      });
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to load user details';
      setError(errorMsg);

      showNotification({
        type: 'error',
        title: 'Load Failed',
        message: errorMsg,
        priority: 'normal',
        pinned: false,
      });

      console.error('User detail load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, showNotification]);

  // Load user detail on mount or userId change
  useEffect(() => {
    loadUserDetail();
  }, [loadUserDetail]);

  /**
   * Refresh user data (clear cache, reload)
   * Mirrors C# RefreshDataCommand
   * Updated for Epic 4: Uses Logic Engine cache invalidation
   */
  const refreshData = useCallback(async () => {
    try {
      setLoadingMessage('Clearing cache...');

      // Epic 4: Invalidate Logic Engine cache
      await window.electronAPI.logicEngine.invalidateCache();

      setLoadingMessage('Reloading user data...');

      // Reload
      await loadUserDetail();
    } catch (err: any) {
      showNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: err?.message || 'Failed to refresh user data',
        priority: 'normal',
        pinned: false,
      });
    }
  }, [loadUserDetail, showNotification]);

  /**
   * Add user to migration wave
   * Opens MigrationWaveDialog with user pre-selected
   */
  const addToMigrationWave = useCallback(() => {
    if (!userDetail) return;

    openModal({
      type: 'custom',
      title: 'Add to Migration Wave',
      data: {
        preSelectedItems: [
          {
            id: userDetail.user.id || userDetail.user.userPrincipalName || '',
            type: 'user',
            displayName: userDetail.user.displayName || 'Unknown User',
          },
        ],
      },
      onConfirm: (waveId: string) => {
        addItemToWave(waveId, {
          id: userDetail.user.id || userDetail.user.userPrincipalName || '',
          type: 'user',
          name: userDetail.user.displayName || 'Unknown User',
          displayName: userDetail.user.displayName || 'Unknown User',
        });

        showNotification({
          type: 'success',
          title: 'Added to Wave',
          message: `Added ${userDetail.user.displayName} to migration wave`,
          priority: 'normal',
          pinned: false,
        });
      },
    });
  }, [userDetail, openModal, addItemToWave, showNotification]);

  /**
   * Export user snapshot to JSON or CSV
   * Mirrors C# ExportSnapshotCommand
   */
  const exportSnapshot = useCallback(
    async (format: 'json' | 'csv') => {
      if (!userDetail) return;

      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const upn = userDetail.user.userPrincipalName || 'unknown';
        const fileName = `user_${upn.split('@')[0]}_${timestamp}.${format}`;

        setLoadingMessage(`Exporting user snapshot to ${format.toUpperCase()}...`);

        const result: any = await window.electronAPI?.invoke('export-user-snapshot', {
          userDetail,
          format,
          fileName,
        });

        if (result?.success) {
          showNotification({
            type: 'success',
            title: 'Export Complete',
            message: `Exported user snapshot to ${fileName}`,
            priority: 'normal',
            pinned: false,
          });
        } else {
          throw new Error(result?.error || 'Export failed');
        }
      } catch (err: any) {
        showNotification({
          type: 'error',
          title: 'Export Failed',
          message: err?.message || 'Failed to export user snapshot',
          priority: 'normal',
          pinned: false,
        });
      } finally {
        setLoadingMessage('');
      }
    },
    [userDetail, showNotification]
  );

  /**
   * Close the user detail view tab
   * Mirrors C# CloseCommand (lines 192-196)
   */
  const closeView = useCallback(() => {
    // Find and close the current tab
    if (selectedTabId) {
      closeTab(selectedTabId);
    }
  }, [selectedTabId, closeTab]);

  return {
    userDetail,
    isLoading,
    error,
    loadingMessage,
    selectedTab,
    setSelectedTab,
    refreshData,
    addToMigrationWave,
    exportSnapshot,
    closeView,
  };
}
