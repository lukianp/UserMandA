/**
 * Group Detail Logic Hook
 *
 * Manages data loading, caching, and actions for GroupDetailView.
 * Mirrors useUserDetailLogic pattern.
 *
 * Epic 1 Task 1.4: GroupsView Detail Implementation
 */

import { useState, useEffect, useCallback } from 'react';

import type { GroupDetailProjection } from '../types/models/groupDetail';
import { useTabStore } from '../store/useTabStore';
import { useModalStore } from '../store/useModalStore';
import { useMigrationStore } from '../store/useMigrationStore';
import { useNotificationStore } from '../store/useNotificationStore';

export interface UseGroupDetailLogicResult {
  // State
  groupDetail: GroupDetailProjection | null;
  isLoading: boolean;
  error: string | null;
  loadingMessage: string;
  selectedTab: number;

  // Actions
  setSelectedTab: (index: number) => void;
  refreshData: () => Promise<void>;
  addToMigrationWave: () => void;
  exportSnapshot: (format: 'json' | 'csv') => Promise<void>;
  addMember: () => void;
  editGroup: () => void;
  closeView: () => void;
}

/**
 * Group Detail Logic Hook
 *
 * @param groupId - Group identifier (SID or Object ID)
 * @returns Group detail state and actions
 */
export function useGroupDetailLogic(groupId: string): UseGroupDetailLogicResult {
  // State
  const [groupDetail, setGroupDetail] = useState<GroupDetailProjection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing...');
  const [selectedTab, setSelectedTab] = useState<number>(0); // 0-5 for 6 tabs

  // Store access
  const closeTab = useTabStore((state) => state.closeTab);
  const selectedTabId = useTabStore((state) => state.selectedTabId);
  const openModal = useModalStore((state) => state.openModal);
  const addItemToWave = useMigrationStore((state) => state.addItemToWave);
  const showNotification = useNotificationStore((state) => state.addNotification);

  /**
   * Load group detail from LogicEngineService via IPC
   */
  const loadGroupDetail = useCallback(async () => {
    if (!groupId) {
      setError('No group identifier provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setLoadingMessage('Loading group data from LogicEngine...');

      // Call IPC handler 'get-group-detail'
      const result: any = await window.electronAPI?.invoke('get-group-detail', { groupId });

      if (!result || !result.success) {
        throw new Error(result?.error || 'Group not found');
      }

      setGroupDetail(result.data);
      setLoadingMessage('');

      showNotification({
        type: 'success',
        title: 'Group Details Loaded',
        message: `Loaded details for ${result.data?.group?.name || groupId}`,
        priority: 'normal',
        pinned: false,
      });
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to load group details';
      setError(errorMsg);

      showNotification({
        type: 'error',
        title: 'Load Failed',
        message: errorMsg,
        priority: 'high',
        pinned: false,
      });

      console.error('Group detail load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [groupId, showNotification]);

  // Load group detail on mount or groupId change
  useEffect(() => {
    loadGroupDetail();
  }, [loadGroupDetail]);

  /**
   * Refresh group data (clear cache, reload)
   */
  const refreshData = useCallback(async () => {
    try {
      setLoadingMessage('Clearing cache...');

      // Clear any cached data for this group
      await window.electronAPI?.invoke('clear-group-detail-cache', { groupId });

      setLoadingMessage('Reloading group data...');

      // Reload
      await loadGroupDetail();
    } catch (err: any) {
      showNotification({
        type: 'error',
        title: 'Refresh Failed',
        message: err?.message || 'Failed to refresh group data',
        priority: 'high',
        pinned: false,
      });
    }
  }, [groupId, loadGroupDetail, showNotification]);

  /**
   * Add group to migration wave
   */
  const addToMigrationWave = useCallback(() => {
    if (!groupDetail) return;

    openModal({
      type: 'custom',
      title: 'Add to Migration Wave',
      data: {
        component: 'MigrationWaveDialog',
        props: {
          preSelectedItems: [
            {
              id: groupDetail.group.id || groupDetail.group.name || '',
              type: 'group',
              displayName: groupDetail.group.name || 'Unknown Group',
            },
          ],
          onConfirm: (waveId: string) => {
            addItemToWave(waveId, {
              id: groupDetail.group.id || groupDetail.group.name || '',
              type: 'group',
              name: groupDetail.group.name || 'Unknown Group',
              displayName: groupDetail.group.name || 'Unknown Group',
            });

            showNotification({
              type: 'success',
              title: 'Added to Wave',
              message: `Added ${groupDetail.group.name} to migration wave`,
              priority: 'normal',
              pinned: false,
            });
          },
        },
      },
      dismissable: true,
      size: 'lg',
    });
  }, [groupDetail, openModal, addItemToWave, showNotification]);

  /**
   * Export group snapshot to JSON or CSV
   */
  const exportSnapshot = useCallback(
    async (format: 'json' | 'csv') => {
      if (!groupDetail) return;

      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const groupName = groupDetail.group.name || 'unknown';
        const fileName = `group_${groupName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${format}`;

        setLoadingMessage(`Exporting group snapshot to ${format.toUpperCase()}...`);

        const result: any = await window.electronAPI?.invoke('export-group-snapshot', {
          groupDetail,
          format,
          fileName,
        });

        if (result?.success) {
          showNotification({
            type: 'success',
            title: 'Export Complete',
            message: `Exported group snapshot to ${fileName}`,
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
          message: err?.message || 'Failed to export group snapshot',
          priority: 'high',
          pinned: false,
        });
      } finally {
        setLoadingMessage('');
      }
    },
    [groupDetail, showNotification]
  );

  /**
   * Add member to group
   * Opens dialog to select and add new members
   */
  const addMember = useCallback(() => {
    if (!groupDetail) return;

    openModal({
      type: 'custom',
      title: 'Add Group Members',
      data: {
        component: 'AddGroupMemberDialog',
        props: {
          groupId: groupDetail.group.id,
          groupName: groupDetail.group.name,
          onConfirm: async (memberIds: string[]) => {
            try {
              setLoadingMessage('Adding members to group...');

              const result: any = await window.electronAPI?.invoke('add-group-members', {
                groupId: groupDetail.group.id,
                memberIds,
              });

              if (result?.success) {
                showNotification({
                  type: 'success',
                  title: 'Members Added',
                  message: `Added ${memberIds.length} member(s) to ${groupDetail.group.name}`,
                  priority: 'normal',
                  pinned: false,
                });

                // Refresh group data to show new members
                await loadGroupDetail();
              } else {
                throw new Error(result?.error || 'Failed to add members');
              }
            } catch (err: any) {
              showNotification({
                type: 'error',
                title: 'Add Members Failed',
                message: err?.message || 'Failed to add members to group',
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
      size: 'lg',
    });
  }, [groupDetail, openModal, showNotification, loadGroupDetail]);

  /**
   * Edit group properties
   */
  const editGroup = useCallback(() => {
    if (!groupDetail) return;

    openModal({
      type: 'custom',
      title: 'Edit Group',
      data: {
        component: 'EditGroupDialog',
        props: {
          group: groupDetail.group,
          onConfirm: async (updatedGroup: any) => {
            try {
              setLoadingMessage('Updating group properties...');

              const result: any = await window.electronAPI?.invoke('update-group', {
                groupId: groupDetail.group.id,
                updates: updatedGroup,
              });

              if (result?.success) {
                showNotification({
                  type: 'success',
                  title: 'Group Updated',
                  message: `Updated ${groupDetail.group.name}`,
                  priority: 'normal',
                  pinned: false,
                });

                // Refresh group data to show updated properties
                await loadGroupDetail();
              } else {
                throw new Error(result?.error || 'Failed to update group');
              }
            } catch (err: any) {
              showNotification({
                type: 'error',
                title: 'Update Failed',
                message: err?.message || 'Failed to update group',
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
      size: 'lg',
    });
  }, [groupDetail, openModal, showNotification, loadGroupDetail]);

  /**
   * Close the group detail view tab
   */
  const closeView = useCallback(() => {
    // Find and close the current tab
    if (selectedTabId) {
      closeTab(selectedTabId);
    }
  }, [selectedTabId, closeTab]);

  return {
    groupDetail,
    isLoading,
    error,
    loadingMessage,
    selectedTab,
    setSelectedTab,
    refreshData,
    addToMigrationWave,
    exportSnapshot,
    addMember,
    editGroup,
    closeView,
  };
}


