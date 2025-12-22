/**
 * AzureResourceMigrationView Component
 *
 * Enhanced Migration Control Plane - Azure Resource Migration View
 * Manages Azure resource migrations with dependency tracking and assessment.
 *
 * Features:
 * - View and manage Azure resource migrations
 * - Resource assessment (complexity, risks, downtime)
 * - Dependency visualization
 * - Execute migrations with progress tracking
 * - Rollback support
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Server,
  Database,
  Cloud,
  Key,
  Globe,
  Shield,
  Layers,
  Activity,
  TrendingUp,
  AlertCircle,
  Trash2,
  Edit2,
  Eye,
} from 'lucide-react';

import { useMigrationStore } from '../../store/useMigrationStore';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import {
  AzureResourceMigration,
  AzureResourceType,
  AzureMigrationMethod,
  ResourceMigrationStatus,
} from '../../types/models/migration';

// Resource type icon mapping
const getResourceIcon = (type: AzureResourceType) => {
  const icons: Record<AzureResourceType, React.ReactNode> = {
    VirtualMachine: <Server size={16} className="text-blue-500" />,
    StorageAccount: <Database size={16} className="text-green-500" />,
    VirtualNetwork: <Globe size={16} className="text-purple-500" />,
    NetworkSecurityGroup: <Shield size={16} className="text-orange-500" />,
    LoadBalancer: <Layers size={16} className="text-cyan-500" />,
    AzureADApplication: <Key size={16} className="text-yellow-500" />,
    AzureADGroup: <Shield size={16} className="text-indigo-500" />,
    AzureADUser: <Shield size={16} className="text-pink-500" />,
    KeyVault: <Key size={16} className="text-red-500" />,
    SQLDatabase: <Database size={16} className="text-blue-600" />,
    AppService: <Cloud size={16} className="text-teal-500" />,
    FunctionApp: <Cloud size={16} className="text-amber-500" />,
    CosmosDB: <Database size={16} className="text-violet-500" />,
    ServiceBus: <Activity size={16} className="text-rose-500" />,
    EventHub: <Activity size={16} className="text-emerald-500" />,
    LogicApp: <Layers size={16} className="text-sky-500" />,
    ContainerRegistry: <Server size={16} className="text-lime-500" />,
    AKSCluster: <Server size={16} className="text-fuchsia-500" />,
  };
  return icons[type] || <Cloud size={16} className="text-gray-500" />;
};

const getStatusBadge = (status: ResourceMigrationStatus) => {
  const configs: Record<ResourceMigrationStatus, { color: string; icon: React.ReactNode }> = {
    Discovered: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: <Eye size={12} /> },
    Analyzed: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: <TrendingUp size={12} /> },
    Planned: { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300', icon: <Clock size={12} /> },
    Ready: { color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: <CheckCircle size={12} /> },
    InProgress: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', icon: <Activity size={12} /> },
    Completed: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', icon: <CheckCircle size={12} /> },
    Failed: { color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: <XCircle size={12} /> },
    RolledBack: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', icon: <RotateCcw size={12} /> },
  };
  const config = configs[status] || configs.Discovered;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${config.color}`}>
      {config.icon}
      {status}
    </span>
  );
};

const getComplexityBadge = (complexity: 'Low' | 'Medium' | 'High' | 'Critical') => {
  const colors: Record<string, string> = {
    Low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    High: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    Critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[complexity]}`}>
      {complexity}
    </span>
  );
};

const AzureResourceMigrationView: React.FC = () => {
  const {
    azureResourceMigrations,
    isLoading,
    error,
    loadAzureResourceMigrations,
    createAzureResourceMigration,
    deleteAzureResourceMigration,
    assessAzureResource,
    executeAzureMigration,
  } = useMigrationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<AzureResourceType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ResourceMigrationStatus | 'all'>('all');
  const [expandedResourceId, setExpandedResourceId] = useState<string | null>(null);
  const [assessingId, setAssessingId] = useState<string | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadAzureResourceMigrations();
  }, [loadAzureResourceMigrations]);

  // Filter resources
  const filteredResources = useMemo(() => {
    return azureResourceMigrations.filter((resource) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !resource.resourceName.toLowerCase().includes(query) &&
          !resource.resourceGroup.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (selectedType !== 'all' && resource.resourceType !== selectedType) {
        return false;
      }
      if (selectedStatus !== 'all' && resource.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [azureResourceMigrations, searchQuery, selectedType, selectedStatus]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: azureResourceMigrations.length,
      discovered: azureResourceMigrations.filter((r) => r.status === 'Discovered').length,
      analyzed: azureResourceMigrations.filter((r) => r.status === 'Analyzed').length,
      inProgress: azureResourceMigrations.filter((r) => r.status === 'InProgress').length,
      completed: azureResourceMigrations.filter((r) => r.status === 'Completed').length,
      failed: azureResourceMigrations.filter((r) => r.status === 'Failed').length,
    };
  }, [azureResourceMigrations]);

  const handleAssess = useCallback(async (id: string) => {
    setAssessingId(id);
    try {
      await assessAzureResource(id);
    } finally {
      setAssessingId(null);
    }
  }, [assessAzureResource]);

  const handleExecute = useCallback(async (id: string) => {
    setExecutingId(id);
    try {
      await executeAzureMigration(id);
    } finally {
      setExecutingId(null);
    }
  }, [executeAzureMigration]);

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this resource migration?')) {
      await deleteAzureResourceMigration(id);
    }
  }, [deleteAzureResourceMigration]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedResourceId((prev) => (prev === id ? null : id));
  }, []);

  if (isLoading && azureResourceMigrations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" label="Loading Azure resource migrations..." />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Cloud size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Azure Resource Migration
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage Azure resource migrations with dependency tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              icon={<RefreshCw size={16} />}
              onClick={() => loadAzureResourceMigrations()}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button icon={<Plus size={16} />}>
              Add Resource
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
      <div className="px-6 py-4 grid grid-cols-6 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-600', icon: <Cloud size={16} /> },
          { label: 'Discovered', value: stats.discovered, color: 'text-gray-500', icon: <Eye size={16} /> },
          { label: 'Analyzed', value: stats.analyzed, color: 'text-blue-600', icon: <TrendingUp size={16} /> },
          { label: 'In Progress', value: stats.inProgress, color: 'text-yellow-600', icon: <Activity size={16} /> },
          { label: 'Completed', value: stats.completed, color: 'text-green-600', icon: <CheckCircle size={16} /> },
          { label: 'Failed', value: stats.failed, color: 'text-red-600', icon: <XCircle size={16} /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              {stat.icon}
              <span className="text-xs uppercase tracking-wide">{stat.label}</span>
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by resource name or resource group..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as AzureResourceType | 'all')}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="VirtualMachine">Virtual Machine</option>
            <option value="StorageAccount">Storage Account</option>
            <option value="SQLDatabase">SQL Database</option>
            <option value="AppService">App Service</option>
            <option value="KeyVault">Key Vault</option>
            <option value="VirtualNetwork">Virtual Network</option>
            <option value="AKSCluster">AKS Cluster</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ResourceMigrationStatus | 'all')}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="Discovered">Discovered</option>
            <option value="Analyzed">Analyzed</option>
            <option value="Planned">Planned</option>
            <option value="Ready">Ready</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Resources List */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {filteredResources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <Cloud size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No Azure Resources</p>
            <p className="text-sm">
              {azureResourceMigrations.length === 0
                ? 'Add Azure resources to start planning migrations.'
                : 'No resources match your current filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Resource Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  onClick={() => toggleExpanded(resource.id)}
                >
                  <div className="flex items-center gap-4">
                    <button className="text-gray-400">
                      {expandedResourceId === resource.id ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                    <div className="flex items-center gap-3">
                      {getResourceIcon(resource.resourceType)}
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {resource.resourceName}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {resource.resourceGroup} • {resource.resourceType}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(resource.status)}
                    {resource.complexity && getComplexityBadge(resource.complexity)}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {resource.migrationMethod}
                    </span>
                    {resource.progress > 0 && resource.progress < 100 && (
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${resource.progress}%` }}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {resource.status === 'Discovered' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<TrendingUp size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssess(resource.id);
                          }}
                          loading={assessingId === resource.id}
                          title="Assess resource"
                        />
                      )}
                      {['Analyzed', 'Planned', 'Ready'].includes(resource.status) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Play size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecute(resource.id);
                          }}
                          loading={executingId === resource.id}
                          title="Execute migration"
                        />
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Trash2 size={14} className="text-red-500" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(resource.id);
                        }}
                        title="Delete"
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedResourceId === resource.id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Source Info */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Source
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Subscription:</span>
                            <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]" title={resource.sourceSubscriptionName}>
                              {resource.sourceSubscriptionName || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Resource Group:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {resource.resourceGroup}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Target Info */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Target
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Subscription:</span>
                            <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]" title={resource.targetSubscriptionName}>
                              {resource.targetSubscriptionName || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Resource Group:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {resource.targetResourceGroup || 'Same'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Region:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {resource.targetRegion || 'Same'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Assessment */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Assessment
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Complexity:</span>
                            {resource.complexity ? (
                              getComplexityBadge(resource.complexity)
                            ) : (
                              <span className="text-gray-400">Not assessed</span>
                            )}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Est. Downtime:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {resource.estimatedDowntime ? `${resource.estimatedDowntime} min` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Dependencies:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {resource.dependencies?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Risks */}
                    {resource.risks && resource.risks.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <AlertTriangle size={14} className="text-orange-500" />
                          Identified Risks
                        </h4>
                        <div className="space-y-1">
                          {resource.risks.map((risk, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <AlertCircle size={12} className="mt-1 text-orange-400" />
                              <span>{risk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Validation Errors */}
                    {resource.preValidationErrors && resource.preValidationErrors.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                          <XCircle size={14} />
                          Validation Errors
                        </h4>
                        <div className="space-y-1">
                          {resource.preValidationErrors.map((err, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                              <XCircle size={12} className="mt-1" />
                              <span>{err}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

export default AzureResourceMigrationView;
