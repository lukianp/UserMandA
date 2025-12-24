/**
 * DetailPanel Component
 *
 * Right-side panel showing detailed information for the selected entity.
 * Displays fact sheet data, metadata, and provides navigation actions.
 */

import React from 'react';
import {
  X,
  Info,
  ArrowRight,
  ExternalLink,
  Tag,
  User,
  Calendar,
  Server,
  Globe,
  Building2,
  Layers,
  Database,
  Shield
} from 'lucide-react';
import { SankeyNode, EntityType } from '../../types/models/organisation';
import { Button } from '../atoms/Button';

interface DetailPanelProps {
  selectedEntity: SankeyNode | null;
  isOpen: boolean;
  onClose: () => void;
  onFocusHere: (entityId: string) => void;
  onOpenFactSheet?: (entityId: string) => void;
}

/**
 * Get icon for entity type
 */
function getEntityIcon(type: EntityType) {
  const iconMap: Record<EntityType, React.ReactNode> = {
    'company': <Building2 size={24} />,
    'platform': <Layers size={24} />,
    'application': <Globe size={24} />,
    'datacenter': <Server size={24} />,
    'provider-interface': <ExternalLink size={24} />,
    'consumer-interface': <ArrowRight size={24} />,
    'business-capability': <Shield size={24} />,
    'it-component': <Database size={24} />
  };
  return iconMap[type] || <Info size={24} />;
}

/**
 * Get color for entity type
 */
function getEntityColor(type: EntityType): string {
  const colorMap: Record<EntityType, string> = {
    'company': '#3b82f6',
    'platform': '#8b5cf6',
    'application': '#10b981',
    'datacenter': '#f59e0b',
    'provider-interface': '#06b6d4',
    'consumer-interface': '#ec4899',
    'business-capability': '#6366f1',
    'it-component': '#84cc16'
  };
  return colorMap[type] || '#6b7280';
}

/**
 * Get status badge color
 */
function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'active': 'bg-green-100 text-green-800',
    'plan': 'bg-blue-100 text-blue-800',
    'phase-in': 'bg-cyan-100 text-cyan-800',
    'phase-out': 'bg-orange-100 text-orange-800',
    'end-of-life': 'bg-red-100 text-red-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  selectedEntity,
  isOpen,
  onClose,
  onFocusHere,
  onOpenFactSheet
}) => {
  if (!selectedEntity || !isOpen) return null;

  const { factSheet, metadata } = selectedEntity;
  const baseInfo = factSheet?.baseInfo;
  const entityColor = getEntityColor(selectedEntity.type);

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
        style={{ borderTopColor: entityColor, borderTopWidth: '4px' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${entityColor}20`, color: entityColor }}
          >
            {getEntityIcon(selectedEntity.type)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[220px]">
              {selectedEntity.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {selectedEntity.type.replace('-', ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Status & Category */}
        <div className="flex items-center gap-2 flex-wrap">
          {baseInfo?.status && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(baseInfo.status)}`}>
              {baseInfo.status.replace('-', ' ')}
            </span>
          )}
          {metadata?.category && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {metadata.category}
            </span>
          )}
        </div>

        {/* Description */}
        {baseInfo?.description && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {baseInfo.description}
            </p>
          </div>
        )}

        {/* Owner */}
        {baseInfo?.owner && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <User size={16} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{baseInfo.owner}</p>
            </div>
          </div>
        )}

        {/* Tags */}
        {baseInfo?.tags && baseInfo.tags.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Tag size={12} />
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {baseInfo.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Section */}
        {metadata?.record && Object.keys(metadata.record).length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Properties
            </h3>
            <div className="space-y-2">
              {Object.entries(metadata.record)
                .filter(([key, value]) =>
                  value &&
                  typeof value === 'string' &&
                  value.length < 100 &&
                  !['Id', 'ObjectId', 'id'].includes(key)
                )
                .slice(0, 8)
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start gap-2 py-1 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{key}</span>
                    <span className="text-xs text-gray-900 dark:text-white text-right truncate max-w-[180px]">
                      {String(value)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Source Info */}
        {metadata?.source && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Calendar size={14} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Source</p>
              <p className="text-xs font-mono text-gray-700 dark:text-gray-300">{metadata.source}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <Button
          onClick={() => onFocusHere(selectedEntity.id)}
          className="w-full justify-center"
          icon={<ArrowRight size={16} />}
        >
          Focus Here
        </Button>

        {onOpenFactSheet && (
          <Button
            variant="ghost"
            onClick={() => onOpenFactSheet(selectedEntity.id)}
            className="w-full justify-center"
            icon={<ExternalLink size={16} />}
          >
            Open Fact Sheet
          </Button>
        )}
      </div>
    </div>
  );
};

export default DetailPanel;
