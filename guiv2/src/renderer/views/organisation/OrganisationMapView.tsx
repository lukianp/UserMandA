/**
 * Organisation Map View
 *
 * LeanIX-style Enterprise Architecture visualization with interactive Sankey diagram.
 * Aggregates all discovery data to show relationships between entities.
 *
 * Phase 6: Updated with FactSheetModal integration
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useOrganisationMapLogic } from '../../hooks/useOrganisationMapLogic';
import { SankeyDiagram } from '../../components/organisms/SankeyDiagram';
import { FactSheetModal } from '../../components/organisms/FactSheetModal';
import { OrganisationMapFilters } from '../../components/organisms/OrganisationMapFilters';
import { SankeyNode, FilterState, EntityType, EntityStatus } from '../../types/models/organisation';
import { Spinner } from '../../components/atoms/Spinner';
import { Button } from '../../components/atoms/Button';
import { Network, RefreshCw, Download, ZoomIn, ZoomOut, Info, Filter, Search } from 'lucide-react';

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
  const [selectedNode, setSelectedNode] = useState<SankeyNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SankeyNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    entityTypes: new Set(ALL_ENTITY_TYPES),
    statuses: new Set(ALL_STATUSES),
    searchQuery: '',
  });

  console.log('[OrganisationMapView] Render:', {
    loading,
    error,
    nodes: data?.nodes.length,
    links: data?.links.length,
    stats
  });

  // Apply filters to the data
  const filteredData = useMemo(() => {
    if (!data) return null;

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

  const handleNodeClick = useCallback((node: SankeyNode) => {
    console.log('[OrganisationMapView] Node clicked:', node);
    setSelectedNode(node);
    setIsModalOpen(true);
  }, []);

  const handleNodeHover = useCallback((node: SankeyNode | null) => {
    setHoveredNode(node);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleNavigateToEntity = useCallback((entityId: string) => {
    // Find the entity in the nodes and open its modal
    const node = data?.nodes.find(n => n.id === entityId);
    if (node) {
      console.log('[OrganisationMapView] Navigating to entity:', node.name);
      setSelectedNode(node);
      // Keep modal open but switch to new entity
    }
  }, [data?.nodes]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleToggleFilters = useCallback(() => {
    setIsFiltersExpanded(prev => !prev);
  }, []);

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
                Enterprise Architecture Visualization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              icon={<Search size={16} />}
              title="Search entities"
            >
              Search
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<ZoomIn size={16} />}
              title="Zoom in"
            />
            <Button
              size="sm"
              variant="ghost"
              icon={<ZoomOut size={16} />}
              title="Zoom out"
            />
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
        filteredCount={filteredData?.nodes.length || 0}
        isExpanded={isFiltersExpanded}
        onToggleExpanded={handleToggleFilters}
      />

      {/* Main Content Area - Sankey Diagram */}
      <div className="flex-1 relative overflow-hidden">
        {filteredData && filteredData.nodes.length > 0 ? (
          <SankeyDiagram
            nodes={filteredData.nodes}
            links={filteredData.links}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
          />
        ) : filteredData && filteredData.nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Filter size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Matching Entities</h3>
              <p className="text-sm">Adjust your filters to see more results.</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Hovered Node Info Panel */}
      {hoveredNode && !isModalOpen && (
        <div className="absolute bottom-20 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700 max-w-sm z-40">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {hoveredNode.name}
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="text-gray-900 dark:text-white capitalize">
                    {hoveredNode.type.replace('-', ' ')}
                  </span>
                </div>
                {hoveredNode.metadata?.category && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <span className="text-gray-900 dark:text-white">
                      {hoveredNode.metadata.category}
                    </span>
                  </div>
                )}
                {hoveredNode.factSheet?.baseInfo?.description && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      {hoveredNode.factSheet.baseInfo.description.substring(0, 100)}
                      {hoveredNode.factSheet.baseInfo.description.length > 100 && '...'}
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-blue-500 mt-2">Click to view details</p>
            </div>
          </div>
        </div>
      )}

      {/* Fact Sheet Modal */}
      <FactSheetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        node={selectedNode}
        onNavigateToEntity={handleNavigateToEntity}
      />
    </div>
  );
};

export default OrganisationMapView;
