/**
 * Inventory List Component
 *
 * Displays consolidated inventory entities with filtering, search, and status management.
 * Shows readiness scores, risk scores, and evidence sources for each entity.
 */

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  Search,
  Filter,
  Download,
  Eye,
  Users,
  UserCheck,
  Box,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
} from 'lucide-react';

import type { InventoryEntity, EntityType, EntityStatus } from '../../types/models/inventory';
import { inventoryService } from '../../services/inventoryService';

interface InventoryListProps {
  entityType: EntityType;
  sourceProfileId: string;
  onEntityClick: (entity: InventoryEntity) => void;
}

const ENTITY_TYPE_CONFIG = {
  USER: { icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20' },
  GROUP: { icon: UserCheck, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' },
  APPLICATION: { icon: Box, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/20' },
  INFRASTRUCTURE: { icon: Server, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
};

const STATUS_CONFIG = {
  DISCOVERED: { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-700', icon: AlertTriangle },
  TRIAGED: { color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-700', icon: Eye },
  VERIFIED: { color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-700', icon: CheckCircle },
  ENRICHED: { color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-700', icon: CheckCircle },
  MIGRATION_READY: { color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-700', icon: CheckCircle },
  MIGRATED: { color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-700', icon: CheckCircle },
};

export const InventoryList: React.FC<InventoryListProps> = ({
  entityType,
  sourceProfileId,
  onEntityClick,
}) => {
  const [entities, setEntities] = useState<InventoryEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadEntities();
  }, [entityType, sourceProfileId, searchQuery, statusFilter]);

  const loadEntities = async () => {
    setLoading(true);
    try {
      const filters: any = {
        sourceProfileId,
        entityType,
        search: searchQuery || undefined,
      };

      if (statusFilter !== 'all') {
        filters.status = statusFilter as EntityStatus;
      }

      const result = await inventoryService.getEntities(filters);
      setEntities(result);
    } catch (error) {
      console.error('[InventoryList] Failed to load entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    console.log('[InventoryList] Export entities:', entities.length);
    // TODO: Implement export functionality
  };

  const getReadinessColor = (score?: number) => {
    if (!score) return 'bg-gray-200 dark:bg-gray-700';
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskColor = (score?: number) => {
    if (!score) return 'bg-gray-200 dark:bg-gray-700';
    if (score <= 0.3) return 'bg-green-500';
    if (score <= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const config = ENTITY_TYPE_CONFIG[entityType];
  const Icon = config.icon;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', config.bgColor)}>
              <Icon size={16} className={config.color} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                {entityType.toLowerCase()}s
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {entities.length} entities in consolidated inventory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder={`Search ${entityType.toLowerCase()}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="DISCOVERED">Discovered</option>
            <option value="TRIAGED">Triaged</option>
            <option value="VERIFIED">Verified</option>
            <option value="ENRICHED">Enriched</option>
            <option value="MIGRATION_READY">Migration Ready</option>
            <option value="MIGRATED">Migrated</option>
          </select>
        </div>
      </div>

      {/* Entity List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {entities.map((entity) => {
            const statusConfig = STATUS_CONFIG[entity.status];
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={entity.id}
                onClick={() => onEntityClick(entity)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', config.bgColor)}>
                      <Icon size={20} className={config.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {entity.displayName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className={clsx(
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            statusConfig.bgColor,
                            statusConfig.color
                          )}
                        >
                          <StatusIcon size={12} className="inline mr-1" />
                          {entity.status.replace('_', ' ')}
                        </span>

                        {entity.waveId && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
                            Wave Assigned
                          </span>
                        )}

                        {/* External IDs */}
                        {Object.entries(entity.externalIds).slice(0, 2).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                            title={`${key}: ${value}`}
                          >
                            {key}: {value.length > 20 ? value.substring(0, 20) + '...' : value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {/* Readiness Score */}
                    <div className="text-center">
                      <div className="text-xs font-medium mb-1 flex items-center gap-1">
                        <Shield size={12} />
                        Readiness
                      </div>
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full transition-all',
                            getReadinessColor(entity.readinessScore)
                          )}
                          style={{ width: `${(entity.readinessScore || 0) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs mt-1 font-semibold">
                        {Math.round((entity.readinessScore || 0) * 100)}%
                      </div>
                    </div>

                    {/* Risk Score */}
                    <div className="text-center">
                      <div className="text-xs font-medium mb-1 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Risk
                      </div>
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full transition-all', getRiskColor(entity.riskScore))}
                          style={{ width: `${(entity.riskScore || 0) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs mt-1 font-semibold">
                        {Math.round((entity.riskScore || 0) * 100)}%
                      </div>
                    </div>

                    {/* External IDs count */}
                    <div className="text-center">
                      <div className="text-xs font-medium mb-1">IDs</div>
                      <div className="text-sm font-semibold">{Object.keys(entity.externalIds).length}</div>
                    </div>
                  </div>
                </div>

                {/* Evidence sources */}
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                    Updated: {new Date(entity.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {entities.length === 0 && (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Icon size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">No {entityType.toLowerCase()}s found</p>
              <p className="text-sm">Run discovery to populate the inventory.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


