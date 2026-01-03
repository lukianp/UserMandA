/**
 * Consolidated Groups View
 *
 * Displays consolidated group entities from all discovery sources
 */

import React, { useState, useEffect } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useProfileStore } from '../../store/useProfileStore';
import { InventoryEntity, EntityStatus } from '../../types/models/inventory';
import { Button } from '../../components/atoms/Button';
import { Search, RefreshCw, Download, UserCheck } from 'lucide-react';

export const ConsolidatedGroupsView: React.FC = () => {
  const { selectedSourceProfile } = useProfileStore();
  const {
    getEntities,
    getEvidenceForEntity,
    getRelationsForEntity,
    getIncomingRelations,
    consolidateFromDiscovery,
    isLoading,
  } = useInventoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EntityStatus | 'ALL'>('ALL');

  // Trigger consolidation on mount if we have a profile
  useEffect(() => {
    console.log('[ConsolidatedGroupsView] 🚀 Component mounted');
    console.log('[ConsolidatedGroupsView] 📋 Selected profile:', selectedSourceProfile?.companyName);

    if (selectedSourceProfile?.companyName) {
      console.log('[ConsolidatedGroupsView] 🔄 Triggering automatic consolidation...');
      consolidateFromDiscovery(selectedSourceProfile.companyName);
    } else {
      console.warn('[ConsolidatedGroupsView] ⚠️ No profile selected, skipping consolidation');
    }
  }, [selectedSourceProfile?.companyName]);

  const groups = getEntities({
    sourceProfileId: selectedSourceProfile?.companyName || '',
    entityType: 'GROUP',
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    search: searchQuery || undefined,
  });

  console.log('[ConsolidatedGroupsView] 📊 Rendering with', groups.length, 'groups');
  console.log('[ConsolidatedGroupsView] 🔍 Filters:', { searchQuery, statusFilter, profileId: selectedSourceProfile?.companyName });

  const handleRefresh = async () => {
    if (selectedSourceProfile?.companyName) {
      await consolidateFromDiscovery(selectedSourceProfile.companyName);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consolidated Groups</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {groups.length} groups from {selectedSourceProfile?.companyName || 'all profiles'}
            </p>
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

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EntityStatus | 'ALL')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            aria-label="Filter by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="DISCOVERED">Discovered</option>
            <option value="TRIAGED">Triaged</option>
            <option value="VERIFIED">Verified</option>
            <option value="ENRICHED">Enriched</option>
            <option value="MIGRATION_READY">Migration Ready</option>
            <option value="MIGRATED">Migrated</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="animate-spin text-blue-500" size={32} />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading groups...</span>
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <UserCheck size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">No groups found</p>
            <Button onClick={handleRefresh} variant="primary" size="sm" className="mt-4">
              <RefreshCw size={16} />
              Consolidate Discovery Data
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {groups.map((group) => {
              const evidence = getEvidenceForEntity(group.id);
              const members = getIncomingRelations(group.id).filter(r => r.relationType === 'MEMBER_OF_GROUP');

              return (
                <div
                  key={group.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <UserCheck size={20} className="text-blue-500" />
                        {group.displayName}
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {members.length} members
                      </div>
                    </div>
                  </div>

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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsolidatedGroupsView;


