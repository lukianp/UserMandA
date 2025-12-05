/**
 * User Assignment Dialog
 *
 * UI for assigning users to migration waves
 */

import React, { useState, useEffect, useMemo } from 'react';

import { useMigrationPlanning } from '../../hooks/useMigrationPlanning';
import LoadingSpinner from '../atoms/LoadingSpinner';

import { Modal } from './Modal';

interface UserAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  waveId: string;
  waveName: string;
  availableUsers: Array<{ id: string; displayName: string; email: string; department?: string }>;
}

export const UserAssignmentDialog: React.FC<UserAssignmentDialogProps> = ({
  isOpen,
  onClose,
  planId,
  waveId,
  waveName,
  availableUsers
}) => {
  const { assignUsersToWave, state } = useMigrationPlanning();

  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current wave to show already assigned users
  const currentWave = useMemo(() => {
    const plan = state.plans.find(p => p.id === planId);
    return plan?.waves.find(w => w.id === waveId);
  }, [state.plans, planId, waveId]);

  // Get unique departments for filtering
  const departments = useMemo(() => {
    const depts = new Set(
      availableUsers.filter(u => u.department).map(u => u.department || '')
    );
    return Array.from(depts).sort();
  }, [availableUsers]);

  // Filter users based on search and department
  const filteredUsers = useMemo(() => {
    let filtered = availableUsers;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        u =>
          u.displayName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          (u.department && u.department.toLowerCase().includes(query))
      );
    }

    if (filterDepartment) {
      filtered = filtered.filter(u => u.department === filterDepartment);
    }

    return filtered;
  }, [availableUsers, searchQuery, filterDepartment]);

  // Track already assigned users
  const alreadyAssignedIds = useMemo(() => {
    return new Set(currentWave?.users || []);
  }, [currentWave]);

  const handleToggleUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleAssign = async () => {
    if (selectedUserIds.size === 0) {
      setError('Please select at least one user');
      return;
    }

    setIsAssigning(true);
    setError(null);

    try {
      await assignUsersToWave(planId, waveId, Array.from(selectedUserIds));
      setSelectedUserIds(new Set());
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedUserIds(new Set());
    setSearchQuery('');
    setFilterDepartment('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Assign Users to ${waveName}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-700">Selected:</span>{' '}
              <span className="font-medium text-blue-800">{selectedUserIds.size}</span>
            </div>
            <div>
              <span className="text-gray-700">Already Assigned:</span>{' '}
              <span className="font-medium text-blue-800">{alreadyAssignedIds.size}</span>
            </div>
            <div>
              <span className="text-gray-700">Available:</span>{' '}
              <span className="font-medium text-blue-800">{availableUsers.length}</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or department..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-48">
            <select
              value={filterDepartment}
              onChange={e => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Select All */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filteredUsers.length > 0 && selectedUserIds.size === filteredUsers.length}
              onChange={handleSelectAll}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Select All Visible</span>
          </label>
          <span className="text-sm text-gray-500">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* User List */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No users found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map(user => {
                const isSelected = selectedUserIds.has(user.id);
                const isAssigned = alreadyAssignedIds.has(user.id);

                return (
                  <div
                    key={user.id}
                    className={`p-3 hover:bg-gray-50 ${
                      isAssigned ? 'bg-green-50' : isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleUser(user.id)}
                        disabled={isAssigned}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded disabled:opacity-50"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                            <p className="text-xs text-gray-600">{user.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {user.department && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                {user.department}
                              </span>
                            )}
                            {isAssigned && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                Assigned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={isAssigning || selectedUserIds.size === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isAssigning ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Assigning...</span>
              </div>
            ) : (
              `Assign ${selectedUserIds.size} User${selectedUserIds.size !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
