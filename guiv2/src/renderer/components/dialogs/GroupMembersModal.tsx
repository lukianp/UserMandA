/**
 * Group Members Modal
 *
 * Modal dialog for viewing and managing group members
 */

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { LoadingSpinner } from '../atoms/LoadingSpinner';
import { useModalStore } from '../../store/useModalStore';
import { VirtualizedDataGrid } from '../organisms/VirtualizedDataGrid';
import type { ColDef } from 'ag-grid-community';

export interface GroupMembersModalProps {
  groupId: string;
  groupName: string;
}

interface GroupMember {
  id: string;
  displayName: string;
  email: string;
  userPrincipalName: string;
  memberType: 'User' | 'Group' | 'Contact';
  accountEnabled: boolean;
}

export const GroupMembersModal: React.FC<GroupMembersModalProps> = ({ groupId, groupName }) => {
  const { closeModal } = useModalStore();

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<GroupMember[]>([]);

  // Load members on mount
  useEffect(() => {
    loadMembers();
  }, [groupId]);

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[GroupMembersModal] Loading members for group:', groupId);

      // Call PowerShell module to get group members
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/GroupDiscovery.psm1',
        functionName: 'Get-GroupMembers',
        parameters: {
          GroupId: groupId,
        },
      });

      if (result.success && Array.isArray(result.data)) {
        setMembers(result.data as GroupMember[]);
        console.log(`[GroupMembersModal] Loaded ${result.data.length} members`);
      } else {
        throw new Error(result.error || 'Failed to load group members');
      }
    } catch (err) {
      console.error('[GroupMembersModal] Failed to load members:', err);
      setError(err instanceof Error ? err.message : 'Failed to load group members');
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMembers = async () => {
    // TODO: Open user selection dialog to add members
    console.log('[GroupMembersModal] Add members - not yet implemented');
    alert('Add Members - Coming Soon!\n\nThis will open a dialog to search and select users to add to the group.');
  };

  const handleRemoveMembers = async () => {
    if (selectedMembers.length === 0) return;

    const confirmed = confirm(
      `Remove ${selectedMembers.length} member(s) from ${groupName}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call PowerShell module to remove members
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Management/GroupManagement.psm1',
        functionName: 'Remove-GroupMembers',
        parameters: {
          GroupId: groupId,
          MemberIds: selectedMembers.map(m => m.id),
        },
      });

      if (result.success) {
        console.log('[GroupMembersModal] Members removed successfully');
        setSelectedMembers([]);
        await loadMembers(); // Reload members
      } else {
        throw new Error(result.error || 'Failed to remove members');
      }
    } catch (err) {
      console.error('[GroupMembersModal] Failed to remove members:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove members');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter members based on search text
  const filteredMembers = members.filter(member => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      member.displayName.toLowerCase().includes(search) ||
      member.email?.toLowerCase().includes(search) ||
      member.userPrincipalName?.toLowerCase().includes(search)
    );
  });

  // Column definitions
  const columnDefs: ColDef<GroupMember>[] = [
    {
      field: 'displayName',
      headerName: 'Display Name',
      sortable: true,
      filter: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      flex: 2,
    },
    {
      field: 'email',
      headerName: 'Email',
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      field: 'memberType',
      headerName: 'Type',
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      field: 'accountEnabled',
      headerName: 'Status',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => (
        <span className={params.value ? 'text-green-600' : 'text-red-600'}>
          {params.value ? 'Enabled' : 'Disabled'}
        </span>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Group Members</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{groupName}</p>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search members..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredMembers.length} of {members.length} members
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={loadMembers}
              variant="secondary"
              size="sm"
              icon={<RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} />}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              onClick={handleAddMembers}
              variant="primary"
              size="sm"
              icon={<UserPlus size={18} />}
              disabled={isLoading}
            >
              Add Members
            </Button>
            <Button
              onClick={handleRemoveMembers}
              variant="danger"
              size="sm"
              icon={<Trash2 size={18} />}
              disabled={selectedMembers.length === 0 || isLoading}
            >
              Remove ({selectedMembers.length})
            </Button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Data Grid */}
        <div className="flex-1 p-6 overflow-hidden">
          {isLoading && members.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <VirtualizedDataGrid
              data={filteredMembers}
              columns={columnDefs}
              loading={isLoading}
              onSelectionChange={setSelectedMembers}
              height="100%"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;
