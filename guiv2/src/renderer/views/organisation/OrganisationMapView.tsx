/**
 * Organisation Map View
 *
 * LeanIX-style Enterprise Architecture visualization with interactive Sankey diagram.
 * Aggregates all discovery data to show relationships between entities.
 */

import React, { useState } from 'react';
import { useOrganisationMapLogic } from '../../hooks/useOrganisationMapLogic';
import { SankeyDiagram } from '../../components/organisms/SankeyDiagram';
import { SankeyNode } from '../../types/models/organisation';
import { Spinner } from '../../components/atoms/Spinner';
import { Button } from '../../components/atoms/Button';
import { Network, RefreshCw, Download, ZoomIn, ZoomOut, Search } from 'lucide-react';

export const OrganisationMapView: React.FC = () => {
  const { data, loading, error, refetch } = useOrganisationMapLogic();
  const [selectedNode, setSelectedNode] = useState<SankeyNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SankeyNode | null>(null);

  console.log('[OrganisationMapView] Render:', { loading, error, nodes: data?.nodes.length, links: data?.links.length });

  const handleNodeClick = (node: SankeyNode) => {
    console.log('[OrganisationMapView] Node clicked:', node);
    setSelectedNode(node);
    // TODO: Open fact sheet modal
  };

  const handleNodeHover = (node: SankeyNode | null) => {
    setHoveredNode(node);
  };

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

      {/* Stats Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Entities:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {data?.nodes.length || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Relationships:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {data?.links.length || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Companies:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {data?.nodes.filter(n => n.type === 'company').length || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Platforms:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {data?.nodes.filter(n => n.type === 'platform').length || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Applications:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {data?.nodes.filter(n => n.type === 'application').length || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">Data Centers:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {data?.nodes.filter(n => n.type === 'datacenter').length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area - Sankey Diagram */}
      <div className="flex-1 relative overflow-hidden">
        {data && (
          <SankeyDiagram
            nodes={data.nodes}
            links={data.links}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
          />
        )}
      </div>

      {/* Hovered Node Info Panel */}
      {hoveredNode && (
        <div className="absolute bottom-20 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700 max-w-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {hoveredNode.name}
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Type:</span>
              <span className="text-gray-900 dark:text-white capitalize">
                {hoveredNode.type.replace('-', ' ')}
              </span>
            </div>
            {hoveredNode.factSheet.baseInfo.description && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">
                  {hoveredNode.factSheet.baseInfo.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganisationMapView;
