/**
 * UserMigrationView Component
 *
 * Enhanced Migration Control Plane - User Migration View
 * Manages user migrations between source and target domains.
 *
 * Features:
 * - View all user migration plans
 * - Create/edit individual migration plans
 * - Bulk create migration plans from discovery data
 * - Configure attribute mappings, license mappings, group mappings
 * - Execute migrations with progress tracking
 * - Pre/post validation support
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  Pause,
  Users,
  User,
  Mail,
  Key,
  Shield,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Download,
  Upload,
  Clock,
  Check,
  X,
  FileText,
  HardDrive,
  ArrowRight,
} from 'lucide-react';

import { useMigrationStore } from '../../store/useMigrationStore';
import { useProfileStore } from '../../store/useProfileStore';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import DataTable from '../../components/DataTable';
import {
  UserMigrationPlan,
  UserMigrationStatus,
  AttributeMapping,
  UserGroupMapping,
  LicenseMapping,
  MailboxMigrationConfig,
} from '../../types/models/migration';

// Status configuration
const STATUS_CONFIG: Record<UserMigrationStatus, { color: string; icon: React.ReactNode; label: string }> = {
  Pending: { color: 'bg-gray-100 text-gray-700', icon: <Clock size={14} />, label: 'Pending' },
  Validated: { color: 'bg-blue-100 text-blue-700', icon: <Check size={14} />, label: 'Validated' },
  Ready: { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} />, label: 'Ready' },
  InProgress: { color: 'bg-yellow-100 text-yellow-700', icon: <RefreshCw size={14} className="animate-spin" />, label: 'In Progress' },
  Completed: { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle size={14} />, label: 'Completed' },
  Failed: { color: 'bg-red-100 text-red-700', icon: <XCircle size={14} />, label: 'Failed' },
  Rollback: { color: 'bg-orange-100 text-orange-700', icon: <RefreshCw size={14} />, label: 'Rollback' },
};

// Initial form state
interface UserMigrationFormData {
  userDisplayName: string;
  userPrincipalName: string;
  sourceDomain: string;
  targetDomain: string;
  newUPN: string;
  passwordSync: boolean;
  passwordSyncMethod: 'Hash' | 'PassThrough' | 'Federation' | 'Reset';
  preserveSID: boolean;
  preserveUPN: boolean;
  enableMailboxMigration: boolean;
  enableOneDriveMigration: boolean;
  notes: string;
}

const initialFormData: UserMigrationFormData = {
  userDisplayName: '',
  userPrincipalName: '',
  sourceDomain: '',
  targetDomain: '',
  newUPN: '',
  passwordSync: true,
  passwordSyncMethod: 'Hash',
  preserveSID: false,
  preserveUPN: true,
  enableMailboxMigration: true,
  enableOneDriveMigration: true,
  notes: '',
};

const UserMigrationView: React.FC = () => {
  const {
    userMigrationPlans,
    domainMappings,
    waves,
    isLoading,
    error,
    loadUserMigrationPlans,
    createUserMigrationPlan,
    updateUserMigrationPlan,
    deleteUserMigrationPlan,
    executeUserMigration,
    bulkCreateUserMigrationPlans,
    loadDomainMappings,
    loadWaves,
  } = useMigrationStore();

  const { selectedSourceProfile, selectedTargetProfile } = useProfileStore();

  // State
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserMigrationFormData>(initialFormData);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserMigrationStatus | 'All'>('All');
  const [domainFilter, setDomainFilter] = useState<string>('All');
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [executingId, setExecutingId] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadUserMigrationPlans();
    loadDomainMappings();
    loadWaves();
  }, [loadUserMigrationPlans, loadDomainMappings, loadWaves]);

  // Get unique domains for filter
  const uniqueDomains = useMemo(() => {
    const domains = new Set<string>();
    userMigrationPlans.forEach(plan => {
      domains.add(plan.sourceDomain);
      domains.add(plan.targetDomain);
    });
    return Array.from(domains).sort();
  }, [userMigrationPlans]);

  // Filter plans
  const filteredPlans = useMemo(() => {
    return userMigrationPlans.filter(plan => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !plan.userDisplayName.toLowerCase().includes(term) &&
          !plan.userPrincipalName.toLowerCase().includes(term)
        ) {
          return false;
        }
      }
      // Status filter
      if (statusFilter !== 'All' && plan.status !== statusFilter) {
        return false;
      }
      // Domain filter
      if (domainFilter !== 'All' && plan.sourceDomain !== domainFilter && plan.targetDomain !== domainFilter) {
        return false;
      }
      return true;
    });
  }, [userMigrationPlans, searchTerm, statusFilter, domainFilter]);

  // Statistics
  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    userMigrationPlans.forEach(plan => {
      byStatus[plan.status] = (byStatus[plan.status] || 0) + 1;
    });
    return {
      total: userMigrationPlans.length,
      pending: byStatus['Pending'] || 0,
      validated: byStatus['Validated'] || 0,
      ready: byStatus['Ready'] || 0,
      inProgress: byStatus['InProgress'] || 0,
      completed: byStatus['Completed'] || 0,
      failed: byStatus['Failed'] || 0,
    };
  }, [userMigrationPlans]);

  // Handlers
  const handleCreateNew = useCallback(() => {
    setFormData(initialFormData);
    setIsCreating(true);
    setEditingId(null);
  }, []);

  const handleEdit = useCallback((plan: UserMigrationPlan) => {
    setFormData({
      userDisplayName: plan.userDisplayName,
      userPrincipalName: plan.userPrincipalName,
      sourceDomain: plan.sourceDomain,
      targetDomain: plan.targetDomain,
      newUPN: plan.newUPN || '',
      passwordSync: plan.passwordSync,
      passwordSyncMethod: plan.passwordSyncMethod,
      preserveSID: plan.preserveSID,
      preserveUPN: plan.preserveUPN,
      enableMailboxMigration: plan.mailboxMigration?.enabled || false,
      enableOneDriveMigration: plan.oneDriveMigration?.enabled || false,
      notes: plan.notes || '',
    });
    setEditingId(plan.id);
    setIsCreating(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this migration plan?')) {
      await deleteUserMigrationPlan(id);
    }
  }, [deleteUserMigrationPlan]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const planData: Partial<UserMigrationPlan> = {
      userDisplayName: formData.userDisplayName,
      userPrincipalName: formData.userPrincipalName,
      sourceDomain: formData.sourceDomain,
      targetDomain: formData.targetDomain,
      newUPN: formData.preserveUPN ? undefined : formData.newUPN,
      passwordSync: formData.passwordSync,
      passwordSyncMethod: formData.passwordSyncMethod,
      preserveSID: formData.preserveSID,
      preserveUPN: formData.preserveUPN,
      mailboxMigration: {
        enabled: formData.enableMailboxMigration,
        migrationType: 'Staged',
        preserveCalendar: true,
        preserveContacts: true,
        preserveRules: true,
        preserveFolders: true,
      } as MailboxMigrationConfig,
      oneDriveMigration: {
        enabled: formData.enableOneDriveMigration,
        preserveSharing: true,
        migrateVersionHistory: true,
      },
      notes: formData.notes,
    };

    if (editingId) {
      await updateUserMigrationPlan(editingId, planData);
    } else {
      await createUserMigrationPlan(planData as any);
    }

    setIsCreating(false);
    setEditingId(null);
    setFormData(initialFormData);
  }, [formData, editingId, createUserMigrationPlan, updateUserMigrationPlan]);

  const handleExecute = useCallback(async (id: string) => {
    setExecutingId(id);
    try {
      await executeUserMigration(id);
    } finally {
      setExecutingId(null);
    }
  }, [executeUserMigration]);

  const handleBulkExecute = useCallback(async () => {
    if (selectedPlans.size === 0) return;
    if (!window.confirm(`Execute migration for ${selectedPlans.size} selected users?`)) return;

    for (const id of selectedPlans) {
      await executeUserMigration(id);
    }
    setSelectedPlans(new Set());
  }, [selectedPlans, executeUserMigration]);

  const handleSelectAll = useCallback(() => {
    if (selectedPlans.size === filteredPlans.length) {
      setSelectedPlans(new Set());
    } else {
      setSelectedPlans(new Set(filteredPlans.map(p => p.id)));
    }
  }, [selectedPlans, filteredPlans]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedPlans(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCancel = useCallback(() => {
    setIsCreating(false);
    setEditingId(null);
    setFormData(initialFormData);
  }, []);

  // Render status badge
  const renderStatusBadge = (status: UserMigrationStatus) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Render progress bar
  const renderProgress = (progress: number) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all ${
          progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  if (isLoading && userMigrationPlans.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Loading user migration plans...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="user-migration-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" size={28} />
            User Migration
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and execute user migrations between domains
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUserMigrationPlans()}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateNew}
          >
            <Plus size={16} />
            Add Migration Plan
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-7 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-gray-50 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <div className="text-sm text-blue-500">Validated</div>
          <div className="text-2xl font-bold text-blue-600">{stats.validated}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <div className="text-sm text-green-500">Ready</div>
          <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <div className="text-sm text-yellow-600">In Progress</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.inProgress}</div>
        </div>
        <div className="bg-emerald-50 rounded-lg shadow p-4">
          <div className="text-sm text-emerald-500">Completed</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <div className="text-sm text-red-500">Failed</div>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
          <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <div className="font-medium text-red-800">Error</div>
            <div className="text-sm text-red-600">{error}</div>
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white rounded-lg shadow-lg border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
            {editingId ? 'Edit Migration Plan' : 'Create Migration Plan'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.userDisplayName}
                  onChange={e => setFormData(prev => ({ ...prev, userDisplayName: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Principal Name *
                </label>
                <input
                  type="text"
                  value={formData.userPrincipalName}
                  onChange={e => setFormData(prev => ({ ...prev, userPrincipalName: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="john.doe@source.com"
                  required
                />
              </div>
            </div>

            {/* Domain Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source Domain *
                </label>
                <input
                  type="text"
                  value={formData.sourceDomain}
                  onChange={e => setFormData(prev => ({ ...prev, sourceDomain: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="source.local"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Domain *
                </label>
                <input
                  type="text"
                  value={formData.targetDomain}
                  onChange={e => setFormData(prev => ({ ...prev, targetDomain: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="target.local"
                  required
                />
              </div>
            </div>

            {/* UPN Configuration */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User size={18} />
                Identity Configuration
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.preserveUPN}
                    onChange={e => setFormData(prev => ({ ...prev, preserveUPN: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Preserve UPN (keep same username)</span>
                </label>
                {!formData.preserveUPN && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New UPN
                    </label>
                    <input
                      type="text"
                      value={formData.newUPN}
                      onChange={e => setFormData(prev => ({ ...prev, newUPN: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="john.doe@target.com"
                    />
                  </div>
                )}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.preserveSID}
                    onChange={e => setFormData(prev => ({ ...prev, preserveSID: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Preserve SID History</span>
                </label>
              </div>
            </div>

            {/* Password Configuration */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Key size={18} />
                Password Configuration
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.passwordSync}
                    onChange={e => setFormData(prev => ({ ...prev, passwordSync: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Enable Password Synchronization</span>
                </label>
                {formData.passwordSync && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sync Method
                    </label>
                    <select
                      value={formData.passwordSyncMethod}
                      onChange={e => setFormData(prev => ({ ...prev, passwordSyncMethod: e.target.value as any }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="Hash">Password Hash Sync</option>
                      <option value="PassThrough">Pass-Through Authentication</option>
                      <option value="Federation">Federation (ADFS/SSO)</option>
                      <option value="Reset">Reset on First Login</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Workload Migration */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <HardDrive size={18} />
                Workload Migration
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 p-3 border rounded-lg bg-white">
                  <input
                    type="checkbox"
                    checked={formData.enableMailboxMigration}
                    onChange={e => setFormData(prev => ({ ...prev, enableMailboxMigration: e.target.checked }))}
                    className="rounded"
                  />
                  <Mail size={18} className="text-blue-500" />
                  <span className="text-sm text-gray-700">Mailbox Migration</span>
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg bg-white">
                  <input
                    type="checkbox"
                    checked={formData.enableOneDriveMigration}
                    onChange={e => setFormData(prev => ({ ...prev, enableOneDriveMigration: e.target.checked }))}
                    className="rounded"
                  />
                  <HardDrive size={18} className="text-blue-500" />
                  <span className="text-sm text-gray-700">OneDrive Migration</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
                placeholder="Optional notes about this migration..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingId ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                placeholder="Search by name or UPN..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Validated">Validated</option>
              <option value="Ready">Ready</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          {/* Domain Filter */}
          <select
            value={domainFilter}
            onChange={e => setDomainFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="All">All Domains</option>
            {uniqueDomains.map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>

          {/* Bulk Actions */}
          {selectedPlans.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500">{selectedPlans.size} selected</span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkExecute}
              >
                <Play size={16} />
                Execute Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Migration Plans List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedPlans.size === filteredPlans.length && filteredPlans.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Migration Path</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workloads</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <Users className="mx-auto mb-2 text-gray-300" size={40} />
                    <div>No migration plans found</div>
                    <div className="text-sm">Create a new plan or adjust your filters</div>
                  </td>
                </tr>
              ) : (
                filteredPlans.map(plan => (
                  <React.Fragment key={plan.id}>
                    <tr className={`hover:bg-gray-50 ${selectedPlans.has(plan.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedPlans.has(plan.id)}
                          onChange={() => handleToggleSelect(plan.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedPlanId === plan.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>
                          <div>
                            <div className="font-medium text-gray-900">{plan.userDisplayName}</div>
                            <div className="text-sm text-gray-500">{plan.userPrincipalName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">{plan.sourceDomain}</span>
                          <ArrowRight size={14} className="text-gray-400" />
                          <span className="text-gray-900 font-medium">{plan.targetDomain}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {renderStatusBadge(plan.status)}
                        {plan.currentStep && (
                          <div className="text-xs text-gray-500 mt-1">{plan.currentStep}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 w-32">
                        <div className="space-y-1">
                          {renderProgress(plan.progress)}
                          <div className="text-xs text-gray-500 text-right">{plan.progress}%</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {plan.mailboxMigration?.enabled && (
                            <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              <Mail size={12} />
                              Mail
                            </span>
                          )}
                          {plan.oneDriveMigration?.enabled && (
                            <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              <HardDrive size={12} />
                              OD
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {plan.status === 'Ready' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleExecute(plan.id)}
                              disabled={executingId === plan.id}
                            >
                              {executingId === plan.id ? (
                                <Spinner size="sm" />
                              ) : (
                                <Play size={14} />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(plan)}
                            disabled={plan.status === 'InProgress'}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(plan.id)}
                            disabled={plan.status === 'InProgress'}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Details */}
                    {expandedPlanId === plan.id && (
                      <tr>
                        <td colSpan={7} className="px-4 py-4 bg-gray-50">
                          <div className="grid grid-cols-3 gap-6">
                            {/* Identity Details */}
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                <User size={16} />
                                Identity Configuration
                              </h4>
                              <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Preserve UPN:</span>
                                  <span>{plan.preserveUPN ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Preserve SID:</span>
                                  <span>{plan.preserveSID ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Password Sync:</span>
                                  <span>{plan.passwordSync ? plan.passwordSyncMethod : 'No'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Validation Status */}
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                <Shield size={16} />
                                Validation
                              </h4>
                              <div className="text-sm space-y-1">
                                <div className="flex items-center gap-2">
                                  {plan.preValidationPassed ? (
                                    <CheckCircle size={14} className="text-green-500" />
                                  ) : (
                                    <XCircle size={14} className="text-red-500" />
                                  )}
                                  <span>Pre-validation: {plan.preValidationPassed ? 'Passed' : 'Failed'}</span>
                                </div>
                                {plan.preValidationErrors?.length > 0 && (
                                  <div className="text-xs text-red-600 ml-6">
                                    {plan.preValidationErrors.slice(0, 3).map((err, i) => (
                                      <div key={i}>- {err}</div>
                                    ))}
                                  </div>
                                )}
                                {plan.postValidationPassed !== undefined && (
                                  <div className="flex items-center gap-2">
                                    {plan.postValidationPassed ? (
                                      <CheckCircle size={14} className="text-green-500" />
                                    ) : (
                                      <XCircle size={14} className="text-red-500" />
                                    )}
                                    <span>Post-validation: {plan.postValidationPassed ? 'Passed' : 'Failed'}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Timing */}
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                <Clock size={16} />
                                Timing
                              </h4>
                              <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Created:</span>
                                  <span>{new Date(plan.createdAt).toLocaleString()}</span>
                                </div>
                                {plan.startedAt && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Started:</span>
                                    <span>{new Date(plan.startedAt).toLocaleString()}</span>
                                  </div>
                                )}
                                {plan.completedAt && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Completed:</span>
                                    <span>{new Date(plan.completedAt).toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          {plan.notes && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-2">
                                <FileText size={16} />
                                Notes
                              </h4>
                              <p className="text-sm text-gray-600">{plan.notes}</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between text-sm text-gray-500">
        <div>
          Showing {filteredPlans.length} of {userMigrationPlans.length} migration plans
        </div>
        <div className="flex items-center gap-4">
          <span>
            Ready for migration: {stats.ready + stats.validated}
          </span>
          <span>
            Success rate: {stats.completed > 0 ? Math.round((stats.completed / (stats.completed + stats.failed)) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserMigrationView;


