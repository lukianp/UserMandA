/**
 * DomainMappingView Component
 *
 * Enhanced Migration Control Plane - Domain Mapping View
 * Manages cross-domain migrations between source and target Active Directory domains.
 *
 * Features:
 * - Create/edit domain mappings
 * - Define attribute mapping rules
 * - Define group mapping rules
 * - Define OU mapping rules
 * - Validate mappings
 * - Test domain connectivity
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Users,
  Building2,
  GitBranch,
  Shield,
  Zap,
  ChevronDown,
  ChevronRight,
  Link2,
  Server,
} from 'lucide-react';

import { useMigrationStore } from '../../store/useMigrationStore';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import {
  DomainMapping,
  AttributeMapping,
  OUMapping,
  TrustLevel,
  MigrationStrategy,
  DomainMappingStatus,
} from '../../types/models/migration';

interface DomainMappingFormData {
  sourceDomain: string;
  targetDomain: string;
  mappingType: 'OneToOne' | 'ManyToOne' | 'OneToMany' | 'Complex';
  trustRelationship: TrustLevel;
  migrationStrategy: MigrationStrategy;
  priority: number;
  notes: string;
}

const initialFormData: DomainMappingFormData = {
  sourceDomain: '',
  targetDomain: '',
  mappingType: 'OneToOne',
  trustRelationship: 'None',
  migrationStrategy: 'Phased',
  priority: 1,
  notes: '',
};

const DomainMappingView: React.FC = () => {
  const {
    domainMappings,
    domains,
    isLoading,
    error,
    loadDomainMappings,
    loadDomains,
    createDomainMapping,
    updateDomainMapping,
    deleteDomainMapping,
    validateDomainMapping,
    testDomainConnectivity,
  } = useMigrationStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DomainMappingFormData>(initialFormData);
  const [expandedMappingId, setExpandedMappingId] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [testingConnectivity, setTestingConnectivity] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadDomainMappings();
    loadDomains();
  }, [loadDomainMappings, loadDomains]);

  const handleCreateNew = useCallback(() => {
    setFormData(initialFormData);
    setIsCreating(true);
    setEditingId(null);
  }, []);

  const handleEdit = useCallback((mapping: DomainMapping) => {
    setFormData({
      sourceDomain: mapping.sourceDomain,
      targetDomain: mapping.targetDomain,
      mappingType: mapping.mappingType,
      trustRelationship: mapping.trustRelationship,
      migrationStrategy: mapping.migrationStrategy,
      priority: mapping.priority,
      notes: mapping.notes || '',
    });
    setEditingId(mapping.id);
    setIsCreating(false);
  }, []);

  const handleCancel = useCallback(() => {
    setIsCreating(false);
    setEditingId(null);
    setFormData(initialFormData);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      if (editingId) {
        await updateDomainMapping(editingId, {
          ...formData,
          userMappingRules: [],
          groupMappingRules: [],
          ouMappingRules: [],
        } as Partial<DomainMapping>);
      } else {
        await createDomainMapping({
          ...formData,
          status: 'Draft' as DomainMappingStatus,
          userMappingRules: [],
          groupMappingRules: [],
          ouMappingRules: [],
          isValidated: false,
          validationErrors: [],
          totalUsers: 0,
          mappedUsers: 0,
          totalGroups: 0,
          mappedGroups: 0,
          createdBy: 'System',
        } as Omit<DomainMapping, 'id' | 'createdAt'>);
      }
      handleCancel();
    } catch (err) {
      console.error('Failed to save domain mapping:', err);
    }
  }, [editingId, formData, createDomainMapping, updateDomainMapping, handleCancel]);

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this domain mapping?')) {
      await deleteDomainMapping(id);
    }
  }, [deleteDomainMapping]);

  const handleValidate = useCallback(async (id: string) => {
    setValidatingId(id);
    try {
      await validateDomainMapping(id);
    } finally {
      setValidatingId(null);
    }
  }, [validateDomainMapping]);

  const handleTestConnectivity = useCallback(async (domainId: string) => {
    setTestingConnectivity(domainId);
    try {
      await testDomainConnectivity(domainId);
    } finally {
      setTestingConnectivity(null);
    }
  }, [testDomainConnectivity]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedMappingId((prev) => (prev === id ? null : id));
  }, []);

  const getStatusBadge = (status: DomainMappingStatus) => {
    const configs: Record<DomainMappingStatus, { color: string; icon: React.ReactNode }> = {
      Draft: { color: 'bg-gray-100 text-gray-700', icon: <Edit2 size={12} /> },
      Validated: { color: 'bg-blue-100 text-blue-700', icon: <CheckCircle size={12} /> },
      Active: { color: 'bg-green-100 text-green-700', icon: <Zap size={12} /> },
      Suspended: { color: 'bg-yellow-100 text-yellow-700', icon: <AlertTriangle size={12} /> },
      Completed: { color: 'bg-purple-100 text-purple-700', icon: <CheckCircle size={12} /> },
    };
    const config = configs[status] || configs.Draft;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${config.color}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  const getTrustLevelBadge = (trust: TrustLevel) => {
    const colors: Record<TrustLevel, string> = {
      None: 'bg-gray-100 text-gray-600',
      OneSided: 'bg-blue-100 text-blue-600',
      BiDirectional: 'bg-green-100 text-green-600',
      Forest: 'bg-purple-100 text-purple-600',
      External: 'bg-orange-100 text-orange-600',
      Realm: 'bg-cyan-100 text-cyan-600',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[trust]}`}>
        {trust}
      </span>
    );
  };

  if (isLoading && domainMappings.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" label="Loading domain mappings..." />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <GitBranch size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Domain Mapping
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure cross-domain migration mappings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              icon={<RefreshCw size={16} />}
              onClick={() => loadDomainMappings()}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              icon={<Plus size={16} />}
              onClick={handleCreateNew}
            >
              New Mapping
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
          <XCircle size={16} className="text-red-500" />
          <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="px-6 py-4 grid grid-cols-5 gap-4">
        {[
          { label: 'Total Mappings', value: domainMappings.length, icon: <GitBranch size={16} />, color: 'text-gray-600' },
          { label: 'Draft', value: domainMappings.filter(m => m.status === 'Draft').length, icon: <Edit2 size={16} />, color: 'text-gray-500' },
          { label: 'Validated', value: domainMappings.filter(m => m.status === 'Validated').length, icon: <CheckCircle size={16} />, color: 'text-blue-600' },
          { label: 'Active', value: domainMappings.filter(m => m.status === 'Active').length, icon: <Zap size={16} />, color: 'text-green-600' },
          { label: 'Completed', value: domainMappings.filter(m => m.status === 'Completed').length, icon: <CheckCircle size={16} />, color: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              {stat.icon}
              <span className="text-xs uppercase tracking-wide">{stat.label}</span>
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="mx-6 mb-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? 'Edit Domain Mapping' : 'Create New Domain Mapping'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Domain
              </label>
              <input
                type="text"
                value={formData.sourceDomain}
                onChange={(e) => setFormData((prev) => ({ ...prev, sourceDomain: e.target.value }))}
                placeholder="e.g., source.contoso.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Domain
              </label>
              <input
                type="text"
                value={formData.targetDomain}
                onChange={(e) => setFormData((prev) => ({ ...prev, targetDomain: e.target.value }))}
                placeholder="e.g., target.fabrikam.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mapping Type
              </label>
              <select
                value={formData.mappingType}
                onChange={(e) => setFormData((prev) => ({ ...prev, mappingType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="OneToOne">One to One</option>
                <option value="ManyToOne">Many to One</option>
                <option value="OneToMany">One to Many</option>
                <option value="Complex">Complex</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trust Relationship
              </label>
              <select
                value={formData.trustRelationship}
                onChange={(e) => setFormData((prev) => ({ ...prev, trustRelationship: e.target.value as TrustLevel }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="None">None</option>
                <option value="OneSided">One-Sided</option>
                <option value="BiDirectional">Bi-Directional</option>
                <option value="Forest">Forest Trust</option>
                <option value="External">External Trust</option>
                <option value="Realm">Realm Trust</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Migration Strategy
              </label>
              <select
                value={formData.migrationStrategy}
                onChange={(e) => setFormData((prev) => ({ ...prev, migrationStrategy: e.target.value as MigrationStrategy }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BigBang">Big Bang (All at once)</option>
                <option value="Phased">Phased (Wave-based)</option>
                <option value="Coexistence">Coexistence (Parallel)</option>
                <option value="Cutover">Cutover (Direct switch)</option>
                <option value="Hybrid">Hybrid (Mixed approach)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData((prev) => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                min={1}
                max={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="Additional notes about this mapping..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.sourceDomain || !formData.targetDomain}>
              {editingId ? 'Update' : 'Create'} Mapping
            </Button>
          </div>
        </div>
      )}

      {/* Mappings List */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        {domainMappings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <GitBranch size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No Domain Mappings</p>
            <p className="text-sm">Create a domain mapping to start configuring cross-domain migrations.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {domainMappings.map((mapping) => (
              <div
                key={mapping.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Mapping Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  onClick={() => toggleExpanded(mapping.id)}
                >
                  <div className="flex items-center gap-4">
                    <button className="text-gray-400">
                      {expandedMappingId === mapping.id ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                    <div className="flex items-center gap-2">
                      <Server size={16} className="text-blue-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {mapping.sourceDomain}
                      </span>
                      <Link2 size={14} className="text-gray-400" />
                      <Server size={16} className="text-green-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {mapping.targetDomain}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(mapping.status)}
                    {getTrustLevelBadge(mapping.trustRelationship)}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {mapping.migrationStrategy}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<CheckCircle size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleValidate(mapping.id);
                        }}
                        loading={validatingId === mapping.id}
                        title="Validate mapping"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Edit2 size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(mapping);
                        }}
                        title="Edit mapping"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Trash2 size={14} className="text-red-500" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(mapping.id);
                        }}
                        title="Delete mapping"
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedMappingId === mapping.id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Statistics */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <Users size={14} />
                          Statistics
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total Users:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{mapping.totalUsers || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Mapped Users:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{mapping.mappedUsers || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total Groups:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{mapping.totalGroups || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Mapped Groups:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{mapping.mappedGroups || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Mapping Rules */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <Settings size={14} />
                          Mapping Rules
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">User Attributes:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {mapping.userMappingRules?.length || 0} rules
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Group Rules:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {mapping.groupMappingRules?.length || 0} rules
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">OU Mappings:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {mapping.ouMappingRules?.length || 0} rules
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Validation Status */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <Shield size={14} />
                          Validation
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            {mapping.isValidated ? (
                              <CheckCircle size={14} className="text-green-500" />
                            ) : (
                              <XCircle size={14} className="text-gray-400" />
                            )}
                            <span className={mapping.isValidated ? 'text-green-600' : 'text-gray-500'}>
                              {mapping.isValidated ? 'Validated' : 'Not validated'}
                            </span>
                          </div>
                          {mapping.lastValidatedAt && (
                            <div className="text-gray-500">
                              Last validated: {new Date(mapping.lastValidatedAt).toLocaleString()}
                            </div>
                          )}
                          {mapping.validationErrors && mapping.validationErrors.length > 0 && (
                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-600 dark:text-red-400">
                              {mapping.validationErrors.map((err, i) => (
                                <div key={i} className="flex items-start gap-1">
                                  <AlertTriangle size={12} className="mt-0.5" />
                                  <span>{err}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {mapping.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{mapping.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                      <Button size="sm" variant="secondary" icon={<Settings size={14} />}>
                        Configure Attribute Rules
                      </Button>
                      <Button size="sm" variant="secondary" icon={<Users size={14} />}>
                        Configure Group Rules
                      </Button>
                      <Button size="sm" variant="secondary" icon={<Building2 size={14} />}>
                        Configure OU Mappings
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainMappingView;


