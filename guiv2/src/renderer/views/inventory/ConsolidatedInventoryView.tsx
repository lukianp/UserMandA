/**
 * ConsolidatedInventoryView Component
 *
 * Main view for the consolidated inventory system.
 * Shows all inventory entities with filtering, selection, and wave assignment.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Database,
  RefreshCw,
  AlertCircle,
  Upload,
  Filter,
  Layers,
  Users,
  Package,
  Server,
  Mail,
  Cloud,
  Network,
  Plus,
  Download,
  Settings,
  ChevronRight
} from 'lucide-react';

import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import { InventoryList } from '../../components/organisms/InventoryList';
import { MigrationWavePanel } from '../../components/organisms/MigrationWavePanel';
import { useInventoryLogic } from '../../hooks/useInventoryLogic';

// Entity type configurations
const ENTITY_TYPE_TABS = [
  { key: 'ALL', label: 'All Entities', icon: Database },
  { key: 'USER', label: 'Users', icon: Users },
  { key: 'GROUP', label: 'Groups', icon: Users },
  { key: 'APPLICATION', label: 'Applications', icon: Package },
  { key: 'INFRASTRUCTURE', label: 'Infrastructure', icon: Server },
  { key: 'MAILBOX', label: 'Mailboxes', icon: Mail },
  { key: 'SHAREPOINT_SITE', label: 'SharePoint', icon: Cloud },
  { key: 'DATABASE', label: 'Databases', icon: Database },
  { key: 'NETWORK_RESOURCE', label: 'Network', icon: Network },
];

/**
 * ConsolidatedInventoryView Component
 */
const ConsolidatedInventoryView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current tab from URL
  const activeTab = searchParams.get('type') || 'ALL';

  // State
  const [showWavePanel, setShowWavePanel] = useState(false);
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);

  // Use the inventory logic hook
  const {
    entities,
    waves,
    waveSummaries,
    statistics,
    suggestions,
    loading,
    error,
    loadEntities,
    loadWaves,
    loadStatistics,
    consolidateInventory,
    assignToWave,
    generateSuggestions,
    applySuggestion,
    createWave,
    startWave,
    pauseWave,
    completeWave,
    deleteWave,
  } = useInventoryLogic();

  // Load data on mount and tab change
  useEffect(() => {
    const filters = activeTab === 'ALL' ? {} : { entityTypes: [activeTab] };
    loadEntities(filters);
    loadStatistics();
    loadWaves();
  }, [activeTab, loadEntities, loadStatistics, loadWaves]);

  // Handle tab change
  const handleTabChange = useCallback((type: string) => {
    setSearchParams({ type });
    setSelectedEntityIds([]);
  }, [setSearchParams]);

  // Handle entity click
  const handleEntityClick = useCallback((entity: any) => {
    navigate(`/inventory/entity/${entity.id}`);
  }, [navigate]);

  // Handle selection change
  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedEntityIds(ids);
  }, []);

  // Handle assign to wave
  const handleAssignToWave = useCallback(async (entityIds: string[]) => {
    setShowWavePanel(true);
    // The wave panel will handle the actual assignment
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    const filters = activeTab === 'ALL' ? {} : { entityTypes: [activeTab] };
    loadEntities(filters);
    loadStatistics();
    loadWaves();
  }, [activeTab, loadEntities, loadStatistics, loadWaves]);

  // Handle consolidation
  const handleConsolidate = useCallback(async () => {
    try {
      await consolidateInventory({ forceFullRebuild: false });
      handleRefresh();
    } catch (err) {
      console.error('Consolidation failed:', err);
    }
  }, [consolidateInventory, handleRefresh]);

  // Handle wave select
  const [selectedWaveId, setSelectedWaveId] = useState<string | undefined>();

  const handleWaveSelect = useCallback((waveId: string) => {
    setSelectedWaveId(waveId);
  }, []);

  // Handle create wave
  const handleCreateWave = useCallback(async () => {
    // This would open a dialog in a real implementation
    const waveName = `Wave ${(waves?.length || 0) + 1}`;
    try {
      await createWave({
        name: waveName,
        description: 'New migration wave',
        sourceProfileId: 'current', // Would get from context
        targetProfileId: 'target', // Would get from context
        priority: (waves?.length || 0) + 1,
      });
      loadWaves();
    } catch (err) {
      console.error('Failed to create wave:', err);
    }
  }, [waves, createWave, loadWaves]);

  // Handle generate suggestions
  const handleGenerateSuggestions = useCallback(async () => {
    try {
      await generateSuggestions({
        sourceProfileId: 'current',
        targetProfileId: 'target',
      });
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
    }
  }, [generateSuggestions]);

  // Filter entities by type
  const filteredEntities = useMemo(() => {
    if (!entities) return [];
    if (activeTab === 'ALL') return entities;
    return entities.filter(e => e.entityType === activeTab);
  }, [entities, activeTab]);

  // Loading state
  if (loading && !entities) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-500">Loading inventory...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !entities) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Inventory
          </h2>
          <p className="text-red-500 mb-6">{error}</p>
          <Button onClick={handleRefresh} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" data-testid="inventory-view">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Consolidated Inventory</h1>
            <p className="text-sm text-gray-500 mt-1">
              Unified view of all discovered entities across discovery modules
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleConsolidate}
              variant="secondary"
              size="sm"
              disabled={loading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Consolidate
            </Button>
            <Button
              onClick={() => setShowWavePanel(!showWavePanel)}
              variant={showWavePanel ? 'primary' : 'secondary'}
              size="sm"
            >
              <Layers className="w-4 h-4 mr-2" />
              Waves
              {waveSummaries && waveSummaries.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {waveSummaries.length}
                </span>
              )}
            </Button>
            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Statistics Bar */}
        {statistics && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">
                {statistics.totalEntities?.toLocaleString() || 0}
              </span>
              <span className="text-gray-500">entities</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Readiness:</span>
              <span className="text-green-600 font-medium">
                {Math.round((statistics.avgReadinessScore || 0) * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Risk:</span>
              <span className="text-amber-600 font-medium">
                {Math.round((statistics.avgRiskScore || 0) * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Relations:</span>
              <span className="text-gray-900 font-medium">
                {statistics.totalRelations?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        )}

        {/* Entity Type Tabs */}
        <div className="flex items-center gap-1 mt-4 -mb-4 overflow-x-auto">
          {ENTITY_TYPE_TABS.map(tab => {
            const Icon = tab.icon;
            const count = tab.key === 'ALL'
              ? statistics?.totalEntities || 0
              : statistics?.byType?.[tab.key] || 0;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg
                  transition-colors whitespace-nowrap
                  ${isActive
                    ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {count > 0 && (
                  <span className={`
                    px-1.5 py-0.5 text-xs rounded-full
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {count.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Inventory List */}
        <div className={`flex-1 overflow-hidden ${showWavePanel ? 'border-r border-gray-200' : ''}`}>
          <InventoryList
            entities={filteredEntities}
            loading={loading}
            error={error}
            selectedIds={selectedEntityIds}
            onSelectionChange={handleSelectionChange}
            onEntityClick={handleEntityClick}
            onRefresh={handleRefresh}
            onAssignToWave={handleAssignToWave}
            entityTypeFilter={activeTab === 'ALL' ? undefined : activeTab}
            showEntityType={activeTab === 'ALL'}
            showWaveColumn={true}
            className="h-full"
          />
        </div>

        {/* Wave Panel */}
        {showWavePanel && (
          <div className="w-96 flex-shrink-0 overflow-hidden bg-gray-50">
            <MigrationWavePanel
              waves={waveSummaries || []}
              suggestions={suggestions}
              loading={loading}
              selectedWaveId={selectedWaveId}
              onWaveSelect={handleWaveSelect}
              onCreateWave={handleCreateWave}
              onEditWave={(id) => navigate(`/inventory/wave/${id}/edit`)}
              onDeleteWave={deleteWave}
              onStartWave={startWave}
              onPauseWave={pauseWave}
              onCompleteWave={completeWave}
              onGenerateSuggestions={handleGenerateSuggestions}
              onApplySuggestion={applySuggestion}
              onRefresh={loadWaves}
              className="h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsolidatedInventoryView;
