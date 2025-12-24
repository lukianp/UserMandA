/**
 * Enhanced Consolidated Users View
 *
 * Displays consolidated user entities with advanced features:
 * - Multi-select with batch operations
 * - Conflict detection and resolution
 * - Batch wave assignment
 * - Enhanced filtering (including "conflicts only")
 * - Conflict indicators and counts
 */

import React, { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useProfileStore } from '../../store/useProfileStore';
import { InventoryEntity, EntityStatus } from '../../types/models/inventory';
import { Button } from '../../components/atoms/Button';
import { Search, RefreshCw, Download, AlertTriangle, Users, CheckSquare, Square } from 'lucide-react';
import { ConflictResolver } from '../../components/inventory/ConflictResolver';

export const ConsolidatedUsersViewEnhanced: React.FC = () => {
  const { selectedSourceProfile } = useProfileStore();
  const {
    getEntities,
    getEvidenceForEntity,
    getRelationsForEntity,
    consolidateFromDiscovery,
    isLoading,
  } = useInventoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EntityStatus | 'ALL'>('ALL');
  const [showConflictsOnly, setShowConflictsOnly] = useState(false);
  const [selectedEntityIds, setSelectedEntityIds] = useState<Set<string>>(new Set());
  const [resolvingConflicts, setResolvingConflicts] = useState<InventoryEntity | null>(null);
  const [showBatchActions, setShowBatchActions] = useState(false);

  // Load users for active profile
  let users = getEntities({
    sourceProfileId: selectedSourceProfile?.companyName || '',
    entityType: 'USER',
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    search: searchQuery || undefined,
  });

  // Filter for conflicts only
  if (showConflictsOnly) {
    users = users.filter(u => u.conflicts && Object.keys(u.conflicts).length > 0);
  }

  const usersWithConflicts = users.filter(u => u.conflicts && Object.keys(u.conflicts).length > 0);

  const handleRefresh = async () => {
    if (selectedSourceProfile?.companyName) {
      await consolidateFromDiscovery(selectedSourceProfile.companyName);
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelection = new Set(selectedEntityIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedEntityIds(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedEntityIds.size === users.length) {
      setSelectedEntityIds(new Set());
    } else {
      setSelectedEntityIds(new Set(users.map(u => u.id)));
    }
  };

  const handleBatchAssignWave = async () => {
    // TODO: Open wave selection dialog
    console.log('[ConsolidatedUsersView] Batch assign to wave:', Array.from(selectedEntityIds));
  };

  const handleResolveConflicts = async (entityId: string, resolutions: Record<string, { value: any; resolvedBy: string }>) => {
    console.log('[ConsolidatedUsersView] Resolving conflicts for entity:', entityId, resolutions);
    // TODO: Call inventory store to update entity with resolutions
    setResolvingConflicts(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consolidated Users</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {users.length} users from {selectedSourceProfile?.companyName || 'all profiles'}
              </p>
              {usersWithConflicts.length > 0 && (
                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  <AlertTriangle size={14} />
                  <span className="text-xs font-medium">{usersWithConflicts.length} conflicts</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} disabled={isLoading} variant="secondary" size="sm">
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button variant="secondary" size="sm">
              <Download size={16} />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EntityStatus | 'ALL')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="DISCOVERED">Discovered</option>
            <option value="TRIAGED">Triaged</option>
            <option value="VERIFIED">Verified</option>
            <option value="ENRICHED">Enriched</option>
            <option value="MIGRATION_READY">Migration Ready</option>
            <option value="MIGRATED">Migrated</option>
          </select>
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer">
            <input
              type="checkbox"
              checked={showConflictsOnly}
              onChange={(e) => setShowConflictsOnly(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Conflicts Only</span>
          </label>
        </div>

        {/* Batch Actions Bar */}
        {selectedEntityIds.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedEntityIds.size} users selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleBatchAssignWave}>
                Assign to Wave
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedEntityIds(new Set())}>
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User List */}
      <div className="flex-1 overflow-auto p-4">
        {/* Select All Bar */}
        {users.length > 0 && (
          <div className="mb-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {selectedEntityIds.size === users.length ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )}
              <span>{selectedEntityIds.size === users.length ? 'Deselect All' : 'Select All'}</span>
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="animate-spin text-blue-500" size={32} />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <Search size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm mt-1">Try adjusting your filters or run consolidation</p>
            <Button onClick={handleRefresh} variant="primary" size="sm" className="mt-4">
              <RefreshCw size={16} />
              Consolidate Discovery Data
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {users.map((user) => {
              const evidence = getEvidenceForEntity(user.id);
              const relations = getRelationsForEntity(user.id);
              const isSelected = selectedEntityIds.has(user.id);
              const hasConflicts = user.conflicts && Object.keys(user.conflicts).length > 0;
              const conflictCount = hasConflicts ? Object.keys(user.conflicts!).length : 0;

              return (
                <div
                  key={user.id}
                  className={`bg-white dark:bg-gray-800 border rounded-lg p-4 transition-all ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleSelectUser(user.id)}
                      className="mt-1 flex-shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="text-blue-600 dark:text-blue-400" size={20} />
                      ) : (
                        <Square className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" size={20} />
                      )}
                    </button>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {user.displayName}
                            </h3>
                            <StatusBadge status={user.status} />
                            {user.waveId && (
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                                Wave {user.waveId}
                              </span>
                            )}
                            {hasConflicts && (
                              <button
                                onClick={() => setResolvingConflicts(user)}
                                className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full hover:bg-orange-200 dark:hover:bg-orange-800"
                              >
                                <AlertTriangle size={12} />
                                <span>{conflictCount} conflict{conflictCount > 1 ? 's' : ''}</span>
                              </button>
                            )}
                          </div>
                          <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>UPN: {user.externalIds.upn || 'N/A'}</span>
                            <span>•</span>
                            <span>Email: {user.externalIds.mail || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Scores */}
                        <div className="flex gap-4 text-sm">
                          {user.readinessScore !== undefined && (
                            <div className="text-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Readiness</div>
                              <div className={`font-semibold ${getScoreColor(user.readinessScore)}`}>
                                {Math.round(user.readinessScore * 100)}%
                              </div>
                            </div>
                          )}
                          {user.riskScore !== undefined && (
                            <div className="text-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">Risk</div>
                              <div className={`font-semibold ${getRiskColor(user.riskScore)}`}>
                                {Math.round(user.riskScore * 100)}%
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Evidence Sources & Relations */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Sources:</span>
                          {evidence.map((ev, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                            >
                              {ev.module}
                            </span>
                          ))}
                          {evidence.length === 0 && (
                            <span className="text-xs text-gray-400">No evidence</span>
                          )}
                        </div>
                        <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                          <span>{relations.length} relations</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Conflict Resolver Modal */}
      {resolvingConflicts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ConflictResolver
            entityId={resolvingConflicts.id}
            entityName={resolvingConflicts.displayName}
            conflicts={resolvingConflicts.conflicts || {}}
            onResolve={handleResolveConflicts}
            onCancel={() => setResolvingConflicts(null)}
          />
        </div>
      )}
    </div>
  );
};

// Helper Components
const StatusBadge: React.FC<{ status: EntityStatus }> = ({ status }) => {
  const colors: Record<EntityStatus, string> = {
    DISCOVERED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    TRIAGED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    VERIFIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    ENRICHED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    MIGRATION_READY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    MIGRATED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const getScoreColor = (score: number): string => {
  if (score >= 0.8) return 'text-green-600 dark:text-green-400';
  if (score >= 0.5) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const getRiskColor = (score: number): string => {
  if (score >= 0.7) return 'text-red-600 dark:text-red-400';
  if (score >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
};

export default ConsolidatedUsersViewEnhanced;
