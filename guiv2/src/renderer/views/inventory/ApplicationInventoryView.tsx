/**
 * ApplicationInventoryView
 *
 * Consolidated application inventory view with:
 * - TieredExplorer for navigating applications and relations
 * - ApplicationFactSheet for detailed application information
 * - Statistics dashboard with lifecycle/criticality breakdown
 * - Import from discovery capabilities
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Download,
  Upload,
  BarChart3,
  Grid,
  List,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Briefcase,
  Activity,
} from 'lucide-react';

import { useApplicationFactSheetLogic } from '../../hooks/useApplicationFactSheetLogic';
import { ApplicationFactSheet } from '../../components/organisms/ApplicationFactSheet';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import { useProfileStore } from '../../store/useProfileStore';
import type {
  ApplicationFactSheet as FactSheetType,
  FactSheetSummary,
  FactSheetStatistics,
  ApplicationLifecyclePhase,
  ApplicationCriticality,
  MigrationDisposition,
} from '../../types/models/applicationFactSheet';

// ============================================================================
// Constants
// ============================================================================

const LIFECYCLE_COLORS: Record<ApplicationLifecyclePhase, string> = {
  plan: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  phase_in: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  phase_out: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  end_of_life: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const CRITICALITY_COLORS: Record<ApplicationCriticality, string> = {
  mission_critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  business_critical: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  business_operational: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  administrative: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
};

const DISPOSITION_LABELS: Record<MigrationDisposition, string> = {
  retain: 'Retain',
  retire: 'Retire',
  replace: 'Replace',
  rehost: 'Rehost',
  refactor: 'Refactor',
  replatform: 'Replatform',
  repurchase: 'Repurchase',
};

// ============================================================================
// Helper Components
// ============================================================================

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, trend }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      {trend !== undefined && (
        <span className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  </div>
);

interface LifecycleChartProps {
  data: Record<ApplicationLifecyclePhase, number>;
  total: number;
}

const LifecycleChart: React.FC<LifecycleChartProps> = ({ data, total }) => {
  const phases: ApplicationLifecyclePhase[] = ['plan', 'phase_in', 'active', 'phase_out', 'end_of_life'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Lifecycle Distribution</h3>
      <div className="flex h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        {phases.map((phase) => {
          const pct = total > 0 ? (data[phase] / total) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div
              key={phase}
              className={`${LIFECYCLE_COLORS[phase].split(' ')[0]} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${phase.replace('_', ' ')}: ${data[phase]} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {phases.map((phase) => (
          <div key={phase} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${LIFECYCLE_COLORS[phase].split(' ')[0]}`} />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {phase.replace('_', ' ')}: {data[phase]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ApplicationCardProps {
  app: FactSheetSummary;
  onSelect: () => void;
  isSelected: boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ app, onSelect, isSelected }) => (
  <div
    onClick={onSelect}
    className={`
      p-4 rounded-lg border cursor-pointer transition-all
      ${isSelected
        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }
    `}
  >
    <div className="flex items-start justify-between">
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white">{app.name}</h4>
        {app.vendor && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{app.vendor}</p>
        )}
      </div>
      <span className={`px-2 py-0.5 text-xs rounded-full ${LIFECYCLE_COLORS[app.lifecyclePhase]}`}>
        {app.lifecyclePhase.replace('_', ' ')}
      </span>
    </div>

    <div className="mt-3 flex items-center gap-4">
      <div className="flex items-center gap-1">
        <Activity size={14} className="text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Readiness: {app.readinessScore}%
        </span>
      </div>
      <div className="flex items-center gap-1">
        <AlertTriangle size={14} className="text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Risk: {app.riskScore}%
        </span>
      </div>
    </div>

    <div className="mt-2 flex items-center gap-2">
      <span className={`px-2 py-0.5 text-xs rounded ${CRITICALITY_COLORS[app.criticality]}`}>
        {app.criticality.replace('_', ' ')}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {app.relationCount} relations
      </span>
    </div>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export const ApplicationInventoryView: React.FC = () => {
  // Get profile from store
  const { selectedSourceProfile } = useProfileStore();
  const sourceProfileId = selectedSourceProfile?.id || 'default-profile';

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFactSheetOpen, setIsFactSheetOpen] = useState(false);
  const [lifecycleFilter, setLifecycleFilter] = useState<ApplicationLifecyclePhase[]>([]);
  const [criticalityFilter, setCriticalityFilter] = useState<ApplicationCriticality[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAppName, setNewAppName] = useState('');

  // Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; updated: number; errors: number } | null>(null);

  // Hook
  const {
    factSheets,
    selectedFactSheet,
    statistics,
    isLoading,
    error,
    loadFactSheets,
    loadFactSheet,
    createFactSheet,
    selectFactSheet,
    updateSection,
    importFromDiscovery,
    refresh,
    clearError,
  } = useApplicationFactSheetLogic({ sourceProfileId });

  // Filter applications
  const filteredApps = useMemo(() => {
    let result = factSheets;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(term) ||
          app.vendor?.toLowerCase().includes(term)
      );
    }

    if (lifecycleFilter.length > 0) {
      result = result.filter((app) => lifecycleFilter.includes(app.lifecyclePhase));
    }

    if (criticalityFilter.length > 0) {
      result = result.filter((app) => criticalityFilter.includes(app.criticality));
    }

    return result;
  }, [factSheets, searchTerm, lifecycleFilter, criticalityFilter]);

  // Handlers
  const handleSelectApp = useCallback(async (app: FactSheetSummary) => {
    const full = await loadFactSheet(app.id);
    if (full) {
      selectFactSheet(full);
      setIsFactSheetOpen(true);
    }
  }, [loadFactSheet, selectFactSheet]);

  const handleCloseFactSheet = useCallback(() => {
    setIsFactSheetOpen(false);
  }, []);

  const handleSaveSection = useCallback(async (section: string, updates: any) => {
    if (!selectedFactSheet) return;
    await updateSection(
      selectedFactSheet.id,
      section as any,
      updates
    );
  }, [selectedFactSheet, updateSection]);

  const handleOpenCreateDialog = useCallback(() => {
    setNewAppName('');
    setIsCreateDialogOpen(true);
  }, []);

  const handleConfirmCreate = useCallback(async () => {
    if (newAppName.trim()) {
      const newApp = await createFactSheet(newAppName.trim());
      if (newApp) {
        selectFactSheet(newApp);
        setIsFactSheetOpen(true);
      }
    }
    setIsCreateDialogOpen(false);
    setNewAppName('');
  }, [newAppName, createFactSheet, selectFactSheet]);

  const handleCancelCreate = useCallback(() => {
    setIsCreateDialogOpen(false);
    setNewAppName('');
  }, []);

  // Handle importing from discovery data
  const handleImportFromDiscovery = useCallback(async () => {
    setIsImporting(true);
    setImportResult(null);

    try {
      // Call IPC to read discovered applications
      const discoveryResult = await window.electronAPI.invoke('discovery:get-applications', {
        sourceProfileId,
      });

      if (discoveryResult.success && discoveryResult.data) {
        const apps = discoveryResult.data;

        // Transform discovery data to fact sheet format
        const transformedApps = apps.map((app: any) => ({
          name: app.Name || app.ApplicationName || app.name || 'Unknown',
          vendor: app.Publisher || app.Vendor || app.vendor || undefined,
          version: app.Version || app.version || undefined,
          externalId: app.AppId || app.ObjectId || app.id || undefined,
          applicationType: app.AppType?.toLowerCase().includes('service') ? 'infrastructure' :
                          app.AppType?.toLowerCase().includes('saas') ? 'saas' : 'cots',
          description: app.Description || undefined,
          category: app.Category || undefined,
          tags: app.Tags ? (typeof app.Tags === 'string' ? app.Tags.split(',').map((t: string) => t.trim()) : app.Tags) : [],
        }));

        const result = await importFromDiscovery(
          transformedApps,
          'Discovery',
          discoveryResult.sourceFile || 'ApplicationCatalog.csv'
        );

        setImportResult(result);
      } else {
        // No IPC handler, try direct file read via Electron API
        const fileResult = await window.electronAPI.invoke('file:read-csv', {
          filePath: 'ApplicationCatalog.csv',
          profileId: sourceProfileId,
        });

        if (fileResult.success && fileResult.data) {
          const result = await importFromDiscovery(
            fileResult.data,
            'Discovery',
            'ApplicationCatalog.csv'
          );
          setImportResult(result);
        } else {
          setImportResult({ created: 0, updated: 0, errors: 1 });
        }
      }
    } catch (err) {
      console.error('Import failed:', err);
      setImportResult({ created: 0, updated: 0, errors: 1 });
    } finally {
      setIsImporting(false);
    }
  }, [sourceProfileId, importFromDiscovery]);

  // Render loading state
  if (isLoading && factSheets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Application Inventory
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage and track applications across your organization
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={refresh} disabled={isLoading}>
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button variant="secondary" size="sm" onClick={handleImportFromDiscovery} disabled={isImporting}>
              <Upload size={16} className={isImporting ? 'animate-pulse' : ''} />
              {isImporting ? 'Importing...' : 'Import from Discovery'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenCreateDialog}>
              <Plus size={16} />
              Add Application
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="px-6 py-4 grid grid-cols-4 gap-4">
          <StatCard
            label="Total Applications"
            value={statistics.total}
            icon={<Briefcase size={20} className="text-emerald-600" />}
            color="bg-emerald-100 dark:bg-emerald-900/30"
          />
          <StatCard
            label="Avg Readiness"
            value={`${statistics.averageReadiness}%`}
            icon={<CheckCircle size={20} className="text-blue-600" />}
            color="bg-blue-100 dark:bg-blue-900/30"
          />
          <StatCard
            label="Avg Risk"
            value={`${statistics.averageRisk}%`}
            icon={<AlertTriangle size={20} className="text-orange-600" />}
            color="bg-orange-100 dark:bg-orange-900/30"
          />
          <StatCard
            label="Completeness"
            value={`${statistics.averageCompleteness}%`}
            icon={<Activity size={20} className="text-purple-600" />}
            color="bg-purple-100 dark:bg-purple-900/30"
          />
        </div>
      )}

      {/* Lifecycle Chart */}
      {statistics && (
        <div className="px-6 pb-4">
          <LifecycleChart data={statistics.byLifecycle} total={statistics.total} />
        </div>
      )}

      {/* Filters & Search */}
      <div className="px-6 py-3 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            >
              <Grid size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            >
              <List size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Result count */}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredApps.length} of {factSheets.length} applications
          </span>
        </div>
      </div>

      {/* Application Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <Briefcase size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">No applications found</p>
            <p className="text-sm">Import applications from discovery data or add manually</p>
            <div className="flex gap-2 mt-4">
              <Button variant="primary" size="sm" onClick={handleImportFromDiscovery} disabled={isImporting}>
                <Upload size={16} />
                {isImporting ? 'Importing...' : 'Import from Discovery'}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleOpenCreateDialog}>
                <Plus size={16} />
                Add Manually
              </Button>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-2'}>
            {filteredApps.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                onSelect={() => handleSelectApp(app)}
                isSelected={selectedFactSheet?.id === app.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button onClick={clearError} className="ml-2 text-red-500 hover:text-red-700">
            &times;
          </button>
        </div>
      )}

      {/* Import Result Toast */}
      {importResult && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          importResult.errors > 0
            ? 'bg-yellow-100 border border-yellow-300 text-yellow-700'
            : 'bg-green-100 border border-green-300 text-green-700'
        }`}>
          <CheckCircle size={16} />
          <span>
            Imported: {importResult.created} created, {importResult.updated} updated
            {importResult.errors > 0 && `, ${importResult.errors} errors`}
          </span>
          <button onClick={() => setImportResult(null)} className="ml-2 opacity-70 hover:opacity-100">
            &times;
          </button>
        </div>
      )}

      {/* Fact Sheet Modal */}
      <ApplicationFactSheet
        isOpen={isFactSheetOpen}
        onClose={handleCloseFactSheet}
        factSheet={selectedFactSheet}
        onSave={handleSaveSection}
      />

      {/* Create Application Dialog */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New Application
            </h3>
            <input
              type="text"
              placeholder="Enter application name..."
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmCreate()}
              autoFocus
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" size="sm" onClick={handleCancelCreate}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmCreate}
                disabled={!newAppName.trim()}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationInventoryView;


