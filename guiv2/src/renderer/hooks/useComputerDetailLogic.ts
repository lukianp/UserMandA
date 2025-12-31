/**
 * Computer Detail Logic Hook
 *
 * Manages data loading, caching, and actions for ComputerDetailView.
 * Mirrors useUserDetailLogic pattern.
 *
 * Epic 1 Task 1.3: ComputersView Detail Implementation
 */

import { useState, useEffect, useCallback } from 'react';

import type { ComputerDetailProjection } from '../types/models/computerDetail';
import { useTabStore } from '../store/useTabStore';
import { useModalStore } from '../store/useModalStore';
import { useMigrationStore } from '../store/useMigrationStore';
import { useNotificationStore } from '../store/useNotificationStore';

export interface UseComputerDetailLogicResult {
  // State
  computerDetail: ComputerDetailProjection | null;
  isLoading: boolean;
  error: string | null;
  loadingMessage: string;
  selectedTab: number;

  // Actions
  setSelectedTab: (index: number) => void;
  refreshData: () => Promise<void>;
  addToMigrationWave: () => void;
  exportSnapshot: (format: 'json' | 'csv') => Promise<void>;
  remoteConnect: () => void;
  closeView: () => void;
}

/**
 * Computer Detail Logic Hook
 *
 * @param computerId - Computer identifier (name or ID)
 * @returns Computer detail state and actions
 */
export function useComputerDetailLogic(computerId: string): UseComputerDetailLogicResult {
  // State
  const [computerDetail, setComputerDetail] = useState<ComputerDetailProjection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing...');
  const [selectedTab, setSelectedTab] = useState<number>(0); // 0-5 for 6 tabs

  // Store access
  const closeTab = useTabStore((state) => state.closeTab);
  const selectedTabId = useTabStore((state) => state.selectedTabId);
  const openModal = useModalStore((state) => state.openModal);
  // Store access
  console.log('Migration store state methods:', Object.keys(useMigrationStore.getState()));
  const addItemToWave = useMigrationStore((state) => {
    console.log('MigrationState keys:', Object.keys(state));
    return state.addItemToWave;
  });
  const showNotification = useNotificationStore((state) => state.addNotification);

  /**
   * Load computer detail from LogicEngineService via IPC
   */
  const loadComputerDetail = useCallback(async () => {
    if (!computerId) {
      setError('No computer identifier provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setLoadingMessage('Loading computer data from LogicEngine...');

      // Call IPC handler 'get-computer-detail'
      const result: any = await window.electronAPI?.invoke('get-computer-detail', { computerId });

      if (!result || !result.success) {
        throw new Error(result?.error || 'Computer not found');
      }

      setComputerDetail(result.data);
      setLoadingMessage('');

      showNotification({
        type: 'success',
        title: 'Computer Details Loaded',
        message: `Loaded details for ${result.data?.computer?.name || computerId}`,
        priority: 'normal',
        pinned: false,
      });
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to load computer details';
      setError(errorMsg);

      showNotification({
        type: 'error',
        title: 'Load Failed',
        message: errorMsg,
        priority: 'high',
        pinned: false,
      });

      console.error('Computer detail load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [computerId, showNotification]);

  // Load computer detail on mount or computerId change
  useEffect(() => {
    loadComputerDetail();
  }, [loadComputerDetail]);

  /**
   * Refresh computer data (clear cache, reload)
   */
  const refreshData = useCallback(async () => {
    try {
      setLoadingMessage('Clearing cache...');

      // Clear any cached data for this computer
      await window.electronAPI?.invoke('clear-computer-detail-cache', { computerId });

      setLoadingMessage('Reloading computer data...');

      // Reload
      await loadComputerDetail();
    } catch (err: any) {
      showNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: err?.message || 'Failed to refresh computer data',
        priority: 'high',
        pinned: false,
      });
    }
  }, [computerId, loadComputerDetail, showNotification]);

  /**
   * Add computer to migration wave
   */
  const addToMigrationWave = useCallback(() => {
    if (!computerDetail) return;

    openModal({
      type: 'custom',
      title: 'Add to Migration Wave',
      data: {
        component: 'MigrationWaveDialog',
        props: {
          preSelectedItems: [
            {
              id: computerDetail.computer.id || computerDetail.computer.name || '',
              type: 'computer',
              displayName: computerDetail.computer.name || 'Unknown Computer',
            },
          ],
          onConfirm: (waveId: string) => {
            addItemToWave(waveId, {
              id: computerDetail.computer.id || computerDetail.computer.name || '',
              type: 'computer',
              name: computerDetail.computer.name || 'Unknown Computer',
              displayName: computerDetail.computer.name || 'Unknown Computer',
            });

            showNotification({
              type: 'success',
              title: 'Added to Wave',
              message: `Added ${computerDetail.computer.name} to migration wave`,
              priority: 'normal',
              pinned: false,
            });
          },
        },
      },
      dismissable: true,
      size: 'lg',
    });
  }, [computerDetail, openModal, addItemToWave, showNotification]);

  /**
   * Export computer snapshot to JSON or CSV
   */
  const exportSnapshot = useCallback(
    async (format: 'json' | 'csv') => {
      if (!computerDetail) return;

      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const computerName = computerDetail.computer.name || 'unknown';
        const fileName = `computer_${computerName}_${timestamp}.${format}`;

        setLoadingMessage(`Exporting computer snapshot to ${format.toUpperCase()}...`);

        const result: any = await window.electronAPI?.invoke('export-computer-snapshot', {
          computerDetail,
          format,
          fileName,
        });

        if (result?.success) {
          showNotification({
            type: 'success',
            title: 'Export Complete',
            message: `Exported computer snapshot to ${fileName}`,
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
          message: err?.message || 'Failed to export computer snapshot',
          priority: 'high',
          pinned: false,
        });
      } finally {
        setLoadingMessage('');
      }
    },
    [computerDetail, showNotification]
  );

  /**
   * Initiate remote connection to computer (RDP, PSRemoting, etc.)
   */
  const remoteConnect = useCallback(() => {
    if (!computerDetail) return;

    openModal({
      type: 'custom',
      title: 'Remote Connection',
      data: {
        component: 'RemoteConnectionDialog',
        props: {
          computerName: computerDetail.computer.name,
          ipAddress: computerDetail.computer.ipAddress,
          dns: computerDetail.computer.dns,
          onConnect: async (connectionType: string) => {
            try {
              setLoadingMessage(`Initiating ${connectionType} connection...`);

              const result: any = await window.electronAPI?.invoke('remote-connect', {
                computerId: computerDetail.computer.id,
                connectionType,
              });

              if (result?.success) {
                showNotification({
                  type: 'success',
                  title: 'Connection Initiated',
                  message: `${connectionType} connection to ${computerDetail.computer.name} initiated`,
                  priority: 'normal',
                  pinned: false,
                });
              } else {
                throw new Error(result?.error || 'Connection failed');
              }
            } catch (err: any) {
              showNotification({
                type: 'error',
                title: 'Connection Failed',
                message: err?.message || 'Failed to connect to computer',
                priority: 'high',
                pinned: false,
              });
            } finally {
              setLoadingMessage('');
            }
          },
        },
      },
      dismissable: true,
      size: 'md',
    });
  }, [computerDetail, openModal, showNotification]);

  /**
   * Close the computer detail view tab
   */
  const closeView = useCallback(() => {
    // Find and close the current tab
    if (selectedTabId) {
      closeTab(selectedTabId);
    }
  }, [selectedTabId, closeTab]);

  return {
    computerDetail,
    isLoading,
    error,
    loadingMessage,
    selectedTab,
    setSelectedTab,
    refreshData,
    addToMigrationWave,
    exportSnapshot,
    remoteConnect,
    closeView,
  };
}


