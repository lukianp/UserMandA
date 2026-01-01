/**
 * Organisation Map View
 *
 * LeanIX-style Enterprise Architecture visualization with tiered column-based explorer.
 * Replaces the Sankey diagram with a structured column layout for navigating entity relations.
 *
 * Phase 7: Refactored to TieredExplorer layout
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useOrganisationMapLogic } from '../../hooks/useOrganisationMapLogic';
import { useOrganisationExplorerLogic } from '../../hooks/useOrganisationExplorerLogic';
import { TieredExplorer } from '../../components/organisms/TieredExplorer';
import { DetailPanel } from '../../components/organisms/DetailPanel';
import { FactSheetModal } from '../../components/organisms/FactSheetModal';
import { OrganisationMapFilters } from '../../components/organisms/OrganisationMapFilters';
import { SankeyNode, FilterState, EntityType, EntityStatus } from '../../types/models/organisation';
import { Spinner } from '../../components/atoms/Spinner';
import { Button } from '../../components/atoms/Button';
import { Network, RefreshCw, Download, Home, Filter, Search, ChevronRight, X } from 'lucide-react';

// Default filter state with all types and statuses selected
const ALL_ENTITY_TYPES: EntityType[] = [
  'datacenter', 'it-component', 'application', 'platform',
  'provider-interface', 'consumer-interface', 'business-capability', 'company'
];

const ALL_STATUSES: EntityStatus[] = [
  'active', 'plan', 'phase-in', 'phase-out', 'end-of-life'
];

export const OrganisationMapView: React.FC = () => {
  const { data, loading, error, refetch, stats } = useOrganisationMapLogic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalNode, setModalNode] = useState<SankeyNode | null>(null);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    entityTypes: new Set(ALL_ENTITY_TYPES),
    statuses: new Set(ALL_STATUSES),
    searchQuery: '',
  });

  // Apply filters to the data
  const filteredData = useMemo(() => {
    if (!data) return { nodes: [], links: [] };

    const filteredNodes = data.nodes.filter(node => {
      // Filter by entity type
      if (!filters.entityTypes.has(node.type)) return false;

      // Filter by status
      const nodeStatus = node.factSheet?.baseInfo?.status || 'active';
      if (!filters.statuses.has(nodeStatus)) return false;

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const nameMatch = node.name.toLowerCase().includes(query);
        const typeMatch = node.type.toLowerCase().includes(query);
        const categoryMatch = node.metadata?.category?.toLowerCase().includes(query);
        const descMatch = node.factSheet?.baseInfo?.description?.toLowerCase().includes(query);
        if (!nameMatch && !typeMatch && !categoryMatch && !descMatch) return false;
      }

      return true;
    });

    // Get IDs of filtered nodes
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

    // Filter links to only include those between filtered nodes
    const filteredLinks = data.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
    });

    return { nodes: filteredNodes, links: filteredLinks };
  }, [data, filters]);

  // Initialize the tiered explorer logic with filtered data
  const {
    explorerState,
    initializeWithEntity,
    selectRelationGroup,
    selectEntity,
    focusOnEntity,
    goToBreadcrumb,
    getSelectedEntity,
    closeDetailPanel
  } = useOrganisationExplorerLogic({
    nodes: filteredData.nodes,
    links: filteredData.links
  });

  // Auto-initialize with an entity that has relationships
  useEffect(() => {
    if (filteredData.nodes.length > 0 && filteredData.links.length > 0 && explorerState.columns.length === 0) {
      // Build a map of entity IDs to their relationship counts
      const relationCounts = new Map<string, number>();

      filteredData.links.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        relationCounts.set(sourceId, (relationCounts.get(sourceId) || 0) + 1);
        relationCounts.set(targetId, (relationCounts.get(targetId) || 0) + 1);
      });

      // Find entity with most relationships, preferring certain types
      // Priority order: high-value enterprise entities first, then identity, then infrastructure
      const preferredTypes: EntityType[] = [
        'company',           // Top priority - company/tenant level
        'platform',          // Enterprise platforms (M365, Azure)
        'application',       // Applications
        'datacenter',        // Data centers
        'user',              // Users (important for identity graph)
        'license',           // Licenses (shows user assignments)
        'group',             // Groups
        'subscription',      // Azure subscriptions
        'resource-group',    // Azure resource groups
      ];

      // Types to deprioritize (environment detection workstations, etc.)
      const deprioritizedTypes: EntityType[] = ['it-component'];
      const deprioritizedSources = ['environmentdetection'];

      let rootEntity = filteredData.nodes[0];
      let maxRelations = 0;
      let foundPreferred = false;

      // First try to find a preferred type with relationships
      for (const type of preferredTypes) {
        const candidates = filteredData.nodes.filter(n => n.type === type);
        for (const candidate of candidates) {
          const count = relationCounts.get(candidate.id) || 0;
          if (count > maxRelations) {
            maxRelations = count;
            rootEntity = candidate;
            foundPreferred = true;
          }
        }
        if (foundPreferred && maxRelations > 0) break; // Found one with relationships
      }

      // If no preferred type has relationships, find any entity with most relationships
      // BUT exclude deprioritized types (like environment detection workstations)
      if (!foundPreferred || maxRelations === 0) {
        filteredData.nodes.forEach(node => {
          const count = relationCounts.get(node.id) || 0;
          // Skip deprioritized types unless we have nothing else
          const isDeprioritized = deprioritizedTypes.includes(node.type) ||
            deprioritizedSources.some(src => node.metadata?.source?.toLowerCase().includes(src));

          if (count > maxRelations && !isDeprioritized) {
            maxRelations = count;
            rootEntity = node;
          }
        });

        // Last resort: if still nothing, accept deprioritized types
        if (maxRelations === 0) {
          filteredData.nodes.forEach(node => {
            const count = relationCounts.get(node.id) || 0;
            if (count > maxRelations) {
              maxRelations = count;
              rootEntity = node;
            }
          });
        }
      }

      console.log('[OrganisationMapView] Auto-initializing with root entity:', rootEntity.name, 'Type:', rootEntity.type, 'Relations:', maxRelations);
      initializeWithEntity(rootEntity.id);
    } else if (filteredData.nodes.length > 0 && filteredData.links.length === 0 && explorerState.columns.length === 0) {
      // No links - just pick first entity
      console.log('[OrganisationMapView] No links found, initializing with first entity:', filteredData.nodes[0].name);
      initializeWithEntity(filteredData.nodes[0].id);
    }
  }, [filteredData.nodes, filteredData.links, explorerState.columns.length, initializeWithEntity]);

  // Get available categories for filter suggestions
  const availableCategories = useMemo(() => {
    if (!data) return [];
    const categories = new Set<string>();
    data.nodes.forEach(node => {
      if (node.metadata?.category) {
        categories.add(node.metadata.category);
      }
    });
    return Array.from(categories).sort();
  }, [data]);

  // Handle relation group click
  const handleRelationGroupClick = useCallback((columnIndex: number, key: string) => {
    console.log('[OrganisationMapView] Relation group clicked:', key, 'at column', columnIndex);
    selectRelationGroup(columnIndex, key);
  }, [selectRelationGroup]);

  // Handle entity click
  const handleEntityClick = useCallback((columnIndex: number, entityId: string) => {
    console.log('[OrganisationMapView] Entity clicked:', entityId, 'at column', columnIndex);
    selectEntity(columnIndex, entityId);
  }, [selectEntity]);

  // Handle entity double-click (open fact sheet modal)
  const handleEntityDoubleClick = useCallback((entityId: string) => {
    const node = filteredData.nodes.find(n => n.id === entityId);
    if (node) {
      console.log('[OrganisationMapView] Opening fact sheet for:', node.name);
      setModalNode(node);
      setIsModalOpen(true);
    }
  }, [filteredData.nodes]);

  // Handle focus from detail panel
  const handleFocusHere = useCallback((entityId: string) => {
    console.log('[OrganisationMapView] Focus on entity:', entityId);
    focusOnEntity(entityId);
  }, [focusOnEntity]);

  // Handle opening fact sheet from detail panel
  const handleOpenFactSheet = useCallback((entityId: string) => {
    const node = filteredData.nodes.find(n => n.id === entityId);
    if (node) {
      setModalNode(node);
      setIsModalOpen(true);
    }
  }, [filteredData.nodes]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleNavigateToEntity = useCallback((entityId: string) => {
    // Navigate in explorer and close modal
    focusOnEntity(entityId);
    setIsModalOpen(false);
  }, [focusOnEntity]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleToggleFilters = useCallback(() => {
    setIsFiltersExpanded(prev => !prev);
  }, []);

  // Reset to first entity
  const handleResetExplorer = useCallback(() => {
    if (filteredData.nodes.length > 0) {
      const preferredTypes: EntityType[] = ['company', 'platform', 'application'];
      let rootEntity = filteredData.nodes[0];
      for (const type of preferredTypes) {
        const found = filteredData.nodes.find(n => n.type === type);
        if (found) {
          rootEntity = found;
          break;
        }
      }
      initializeWithEntity(rootEntity.id);
    }
  }, [filteredData.nodes, initializeWithEntity]);

  const selectedEntity = getSelectedEntity();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Spinner size="lg" label="Loading organisation map data..." />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Analyzing discovery data from all sources...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <Network size={48} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Failed to Load Organisation Map
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={refetch} icon={<RefreshCw size={16} />}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Network size={24} className="text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Organisation Map
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enterprise Architecture Explorer • {filteredData.nodes.length} entities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              icon={<Home size={16} />}
              onClick={handleResetExplorer}
              title="Reset to root"
            >
              Reset
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<Download size={16} />}
              title="Export diagram"
            >
              Export
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<RefreshCw size={16} />}
              onClick={refetch}
              title="Refresh data"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Component */}
      <OrganisationMapFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableCategories={availableCategories}
        totalCount={data?.nodes.length || 0}
        filteredCount={filteredData.nodes.length}
        isExpanded={isFiltersExpanded}
        onToggleExpanded={handleToggleFilters}
      />

      {/* Breadcrumb Navigation */}
      {explorerState.breadcrumb.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-2">
          <div className="flex items-center gap-1 text-sm overflow-x-auto">
            {explorerState.breadcrumb.map((item, index) => (
              <React.Fragment key={`${item.id}-${index}`}>
                {index > 0 && (
                  <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                )}
                <button
                  onClick={() => goToBreadcrumb(item.columnIndex)}
                  className={`px-2 py-1 rounded flex-shrink-0 transition-colors ${
                    index === explorerState.breadcrumb.length - 1
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area - Tiered Explorer */}
      <div className="flex-1 relative overflow-hidden">
        {filteredData.nodes.length > 0 ? (
          <TieredExplorer
            explorerState={explorerState}
            onRelationGroupClick={handleRelationGroupClick}
            onEntityClick={handleEntityClick}
            onEntityDoubleClick={handleEntityDoubleClick}
            height={600}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Filter size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Matching Entities</h3>
              <p className="text-sm">Adjust your filters to see more results.</p>
            </div>
          </div>
        )}

        {/* Detail Panel */}
        <DetailPanel
          selectedEntity={selectedEntity}
          isOpen={explorerState.detailPanelOpen}
          onClose={closeDetailPanel}
          onFocusHere={handleFocusHere}
          onOpenFactSheet={handleOpenFactSheet}
        />
      </div>

      {/* Fact Sheet Modal */}
      <FactSheetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        node={modalNode}
        onNavigateToEntity={handleNavigateToEntity}
      />
    </div>
  );
};

export default OrganisationMapView;


