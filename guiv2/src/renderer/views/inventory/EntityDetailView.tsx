/**
 * EntityDetailView Component
 *
 * Detailed view of a single inventory entity showing all evidence,
 * relationships, and migration status.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Edit2,
  Trash2,
  Link,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Layers,
  Users,
  Package,
  Server,
  Mail,
  Cloud,
  Database,
  Network,
  Shield
} from 'lucide-react';

import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';

// Entity type icons
const ENTITY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  USER: Users,
  GROUP: Users,
  APPLICATION: Package,
  INFRASTRUCTURE: Server,
  MAILBOX: Mail,
  SHAREPOINT_SITE: Cloud,
  TEAMS_TEAM: Users,
  DEVICE: Server,
  SERVER: Server,
  DATABASE: Database,
  VIRTUAL_MACHINE: Cloud,
  STORAGE: Database,
  NETWORK_RESOURCE: Network,
};

// Status colors
const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  DISCOVERED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Discovered' },
  TRIAGED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Triaged' },
  VERIFIED: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Verified' },
  ENRICHED: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Enriched' },
  MAPPED: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Mapped' },
  MIGRATION_READY: { bg: 'bg-green-100', text: 'text-green-700', label: 'Migration Ready' },
  MIGRATION_PLANNED: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Migration Planned' },
  MIGRATING: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Migrating' },
  MIGRATED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Migrated' },
  BLOCKED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Blocked' },
  EXCLUDED: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Excluded' },
};

interface EntityDetail {
  entity: {
    id: string;
    entityType: string;
    canonicalName: string;
    displayName: string;
    status: string;
    sourceProfileId: string;
    readinessScore: number;
    riskScore: number;
    waveId?: string;
    waveName?: string;
    discoveryModules: string[];
    createdAt: string;
    updatedAt: string;
    attributes: Record<string, any>;
    externalIds: Record<string, string>;
    notes?: string;
    tags?: string[];
  };
  evidence: Array<{
    id: string;
    module: string;
    source: string;
    discoveredAt: string;
    confidence: number;
    rawData: Record<string, any>;
  }>;
  relations: Array<{
    id: string;
    type: string;
    targetEntityId: string;
    targetEntityName: string;
    targetEntityType: string;
    strength: number;
  }>;
  relatedEntities: Array<{
    id: string;
    entityType: string;
    displayName: string;
    status: string;
  }>;
}

const EntityDetailView: React.FC = () => {
  const navigate = useNavigate();
  const { entityId } = useParams<{ entityId: string }>();

  const [detail, setDetail] = useState<EntityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'relations' | 'attributes'>('overview');

  // Load entity detail
  const loadDetail = useCallback(async () => {
    if (!entityId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.inventory.getEntityDetail(entityId);
      if (result.success && result.data) {
        setDetail(result.data);
      } else {
        setError(result.error || 'Failed to load entity');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Loading state
  if (loading && !detail) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Loading entity details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !detail) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Entity
          </h2>
          <p className="text-red-500 mb-6">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleBack} variant="secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={loadDetail} variant="primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!detail) return null;

  const { entity, evidence, relations, relatedEntities } = detail;
  const EntityIcon = ENTITY_ICONS[entity.entityType] || Package;
  const statusConfig = STATUS_COLORS[entity.status] || STATUS_COLORS.DISCOVERED;

  return (
    <div className="flex flex-col h-full overflow-hidden" data-testid="entity-detail-view">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={handleBack} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="p-3 bg-blue-100 rounded-lg">
            <EntityIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{entity.displayName}</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {entity.entityType} • {entity.canonicalName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={loadDetail}
              variant="secondary"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Scores & Wave */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Readiness:</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    entity.readinessScore >= 0.8 ? 'bg-green-500' :
                    entity.readinessScore >= 0.6 ? 'bg-yellow-500' :
                    entity.readinessScore >= 0.4 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${entity.readinessScore * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {Math.round(entity.readinessScore * 100)}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Risk:</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    entity.riskScore >= 0.8 ? 'bg-red-500' :
                    entity.riskScore >= 0.6 ? 'bg-orange-500' :
                    entity.riskScore >= 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${entity.riskScore * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {Math.round(entity.riskScore * 100)}%
              </span>
            </div>
          </div>
          {entity.waveName && (
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-400" />
              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                {entity.waveName}
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 -mb-4">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'evidence', label: `Evidence (${evidence.length})` },
            { key: 'relations', label: `Relations (${relations.length})` },
            { key: 'attributes', label: 'Attributes' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`
                px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
                ${activeTab === tab.key
                  ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Entity Info */}
            <div className="space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Entity Type</dt>
                    <dd className="text-sm font-medium text-gray-900">{entity.entityType}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Canonical Name</dt>
                    <dd className="text-sm font-medium text-gray-900">{entity.canonicalName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Display Name</dt>
                    <dd className="text-sm font-medium text-gray-900">{entity.displayName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Status</dt>
                    <dd>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(entity.createdAt).toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Updated</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(entity.updatedAt).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Discovery Sources Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Discovery Sources</h3>
                <div className="flex flex-wrap gap-2">
                  {entity.discoveryModules.map((mod, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>

              {/* External IDs Card */}
              {Object.keys(entity.externalIds).length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">External Identifiers</h3>
                  <dl className="space-y-2">
                    {Object.entries(entity.externalIds).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="text-sm text-gray-500">{key}</dt>
                        <dd className="text-sm font-mono text-gray-900 truncate max-w-[200px]" title={value}>
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            {/* Right Column - Related Entities */}
            <div className="space-y-6">
              {/* Related Entities Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Related Entities ({relatedEntities.length})
                </h3>
                {relatedEntities.length === 0 ? (
                  <p className="text-sm text-gray-500">No related entities found</p>
                ) : (
                  <ul className="space-y-2">
                    {relatedEntities.slice(0, 10).map(related => {
                      const RelatedIcon = ENTITY_ICONS[related.entityType] || Package;
                      const relatedStatus = STATUS_COLORS[related.status] || STATUS_COLORS.DISCOVERED;
                      return (
                        <li key={related.id}>
                          <button
                            onClick={() => navigate(`/inventory/entity/${related.id}`)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                          >
                            <RelatedIcon className="w-4 h-4 text-gray-400" />
                            <span className="flex-1 text-sm font-medium text-gray-900 truncate">
                              {related.displayName}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${relatedStatus.bg} ${relatedStatus.text}`}>
                              {related.entityType}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                    {relatedEntities.length > 10 && (
                      <li className="text-sm text-gray-500 text-center pt-2">
                        +{relatedEntities.length - 10} more entities
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Recent Evidence Preview */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Evidence ({evidence.length})
                </h3>
                {evidence.length === 0 ? (
                  <p className="text-sm text-gray-500">No evidence records</p>
                ) : (
                  <ul className="space-y-3">
                    {evidence.slice(0, 5).map(ev => (
                      <li key={ev.id} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{ev.module}</span>
                            <span className="text-xs text-gray-500">
                              {Math.round(ev.confidence * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{ev.source}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(ev.discoveredAt).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Evidence Records</h3>
              <p className="text-sm text-gray-500">
                All discovery evidence supporting this entity
              </p>
            </div>
            {evidence.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No evidence records available
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {evidence.map(ev => (
                  <div key={ev.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-medium text-gray-900">{ev.module}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{ev.source}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {Math.round(ev.confidence * 100)}% confidence
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(ev.discoveredAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-40">
                      {JSON.stringify(ev.rawData, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'relations' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Entity Relations</h3>
              <p className="text-sm text-gray-500">
                Relationships with other inventory entities
              </p>
            </div>
            {relations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No relations found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {relations.map(rel => {
                  const TargetIcon = ENTITY_ICONS[rel.targetEntityType] || Package;
                  return (
                    <div key={rel.id} className="p-4 flex items-center gap-4">
                      <div className="flex-shrink-0 w-32">
                        <span className="text-sm font-medium text-gray-900">
                          {rel.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Link className="w-4 h-4" />
                      </div>
                      <button
                        onClick={() => navigate(`/inventory/entity/${rel.targetEntityId}`)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <TargetIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{rel.targetEntityName}</span>
                        <span className="text-xs text-gray-500">{rel.targetEntityType}</span>
                      </button>
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        Strength: {Math.round(rel.strength * 100)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'attributes' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Entity Attributes</h3>
              <p className="text-sm text-gray-500">
                All discovered attributes for this entity
              </p>
            </div>
            <div className="p-4">
              {Object.keys(entity.attributes).length === 0 ? (
                <p className="text-gray-500">No attributes available</p>
              ) : (
                <pre className="text-sm bg-gray-50 p-4 rounded overflow-x-auto">
                  {JSON.stringify(entity.attributes, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityDetailView;
