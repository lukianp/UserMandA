/**
 * SankeyDiagram Component
 *
 * Enhanced LeanIX-style D3.js-powered Sankey diagram for Organization Map.
 * Features:
 * - Priority-based layer ordering (Infrastructure → IT Components → Platforms → Business Capabilities)
 * - Interactive node selection and highlighting
 * - Zoom and pan capabilities
 * - Category-based coloring
 *
 * Phase 4: Sankey Diagram Layering Implementation
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
// @ts-expect-error - d3 types not installed, runtime functionality works
import * as d3 from 'd3';
// @ts-expect-error - d3-sankey types not installed, runtime functionality works
import { sankey, sankeyLinkHorizontal, sankeyLeft, sankeyRight, sankeyCenter, sankeyJustify } from 'd3-sankey';
import { SankeyNode, SankeyLink, EntityType } from '../../types/models/organisation';

export interface SankeyDiagramProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  width?: number;
  height?: number;
  onNodeClick?: (node: SankeyNode) => void;
  onNodeHover?: (node: SankeyNode | null) => void;
  layerAlignment?: 'left' | 'right' | 'center' | 'justify';
}

/**
 * Priority to layer mapping for proper left-to-right flow
 * Lower priority = further left in the diagram
 */
const PRIORITY_LAYERS: Record<number, string> = {
  1: 'Infrastructure',
  2: 'IT Components & Applications',
  3: 'Platforms & Services',
  4: 'Business Capabilities'
};

/**
 * Type-based priority mapping for nodes without explicit priority
 */
const TYPE_PRIORITY: Record<EntityType, number> = {
  'datacenter': 1,
  'it-component': 2,
  'application': 2,
  'platform': 3,
  'provider-interface': 3,
  'consumer-interface': 3,
  'company': 4,
  'business-capability': 4
};

// Enhanced type color mapping with layer-based gradients
const TYPE_COLORS: Record<EntityType, string> = {
  'company': '#3b82f6',           // blue-500
  'platform': '#8b5cf6',          // violet-500
  'application': '#10b981',       // emerald-500
  'datacenter': '#f59e0b',        // amber-500
  'provider-interface': '#06b6d4', // cyan-500
  'consumer-interface': '#ec4899', // pink-500
  'business-capability': '#6366f1', // indigo-500
  'it-component': '#84cc16',      // lime-500
};

// Category-based colors for more granular coloring
const CATEGORY_COLORS: Record<string, string> = {
  'Infrastructure': '#f59e0b',
  'Database': '#ef4444',
  'Storage': '#8b5cf6',
  'Network': '#06b6d4',
  'Certificate': '#10b981',
  'Backup': '#6366f1',
  'Dependency': '#ec4899',
  'Scheduled Task': '#84cc16',
  'Environment': '#f97316',
  'File System': '#14b8a6',
  'Data Classification': '#a855f7',
  'Application': '#10b981',
  'EntraID App': '#3b82f6',
  'Exchange': '#f43f5e',
  'SharePoint': '#22c55e',
  'OneDrive': '#0ea5e9',
  'Power Platform': '#a855f7',
  'Power BI': '#eab308',
  'Microsoft Teams': '#6366f1',
  'User': '#22d3ee',
  'Group': '#8b5cf6',
  'Subscription': '#f97316',
  'Tenant': '#059669',
  'Resource Group': '#7c3aed',
  'Directory Role': '#dc2626',
  'Service Principal': '#0284c7',
  'Security': '#ef4444',
  'Policy': '#8b5cf6',
  'Licensing': '#f59e0b',
  'Business Capability': '#6366f1',
  'Azure Resource': '#0ea5e9',
  'Unknown': '#6b7280'
};

/**
 * Get node color based on category or type
 */
function getNodeColor(node: any): string {
  // First try category-based coloring
  const category = node.metadata?.category;
  if (category && CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }

  // Fall back to type-based coloring
  return TYPE_COLORS[node.type as EntityType] || '#6b7280';
}

/**
 * Get node priority for layer ordering
 */
function getNodePriority(node: any): number {
  // First check metadata priority
  if (node.metadata?.priority) {
    return node.metadata.priority;
  }

  // Fall back to type-based priority
  return TYPE_PRIORITY[node.type as EntityType] || 2;
}

/**
 * Sort nodes by priority for layer-based layout
 */
function sortNodesByPriority(nodes: SankeyNode[]): SankeyNode[] {
  return [...nodes].sort((a, b) => {
    const priorityA = getNodePriority(a);
    const priorityB = getNodePriority(b);
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    // Secondary sort by name for consistency
    return a.name.localeCompare(b.name);
  });
}

/**
 * Assign explicit layer (depth) to nodes based on priority
 */
function assignNodeLayers(nodes: any[]): void {
  nodes.forEach(node => {
    const priority = getNodePriority(node);
    // Assign depth based on priority (0-indexed)
    node.layer = priority - 1;
  });
}

export const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
  nodes,
  links,
  width = 1200,
  height = 600,
  onNodeClick,
  onNodeHover,
  layerAlignment = 'justify',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Pre-process nodes with priority sorting
  const processedNodes = useMemo(() => sortNodesByPriority(nodes), [nodes]);

  // Calculate layer statistics
  const layerStats = useMemo(() => {
    const stats: Record<number, number> = {};
    processedNodes.forEach(node => {
      const priority = getNodePriority(node);
      stats[priority] = (stats[priority] || 0) + 1;
    });
    return stats;
  }, [processedNodes]);

  useEffect(() => {
    if (!svgRef.current || processedNodes.length === 0) return;

    console.log('[SankeyDiagram] Rendering with layer stats:', layerStats);
    console.log('[SankeyDiagram] Total:', { nodes: processedNodes.length, links: links.length });

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('background', 'transparent');

    // Add zoom behavior
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: any) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Get alignment function based on prop
    const alignmentFunc = {
      'left': sankeyLeft,
      'right': sankeyRight,
      'center': sankeyCenter,
      'justify': sankeyJustify
    }[layerAlignment] || sankeyJustify;

    // Prepare data for d3-sankey with layer assignments
    const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
      .nodeId((d: any) => d.id)
      .nodeAlign(alignmentFunc)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[50, 50], [width - 50, height - 50]]);

    // Create a copy of the data for d3-sankey (it mutates the objects)
    const graphData = {
      nodes: processedNodes.map(n => {
        const copy = { ...n };
        // Assign layer based on priority
        (copy as any).layer = getNodePriority(n) - 1;
        return copy;
      }),
      links: links.map(l => ({ ...l }))
    };

    // Validate data before generating layout
    if (graphData.nodes.length === 0) {
      console.warn('[SankeyDiagram] No nodes to render');
      g.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9ca3af')
        .attr('font-size', '16px')
        .text('No entities to display');
      return;
    }

    // Filter out links that reference non-existent nodes
    const nodeIds = new Set(graphData.nodes.map(n => n.id));
    const validLinks = graphData.links.filter(l => {
      const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
      const valid = nodeIds.has(sourceId) && nodeIds.has(targetId);
      if (!valid) {
        console.warn('[SankeyDiagram] Skipping invalid link:', sourceId, '->', targetId);
      }
      return valid;
    });

    graphData.links = validLinks;
    console.log('[SankeyDiagram] Validated data:', {
      nodes: graphData.nodes.length,
      validLinks: validLinks.length,
      invalidLinks: links.length - validLinks.length
    });

    // If no links, use grid layout instead of Sankey
    if (validLinks.length === 0) {
      console.warn('[SankeyDiagram] No links found, using grid layout');

      // Calculate grid dimensions
      const nodeCount = graphData.nodes.length;
      const cols = Math.ceil(Math.sqrt(nodeCount));
      const rows = Math.ceil(nodeCount / cols);
      const cellWidth = (width - 40) / cols;
      const cellHeight = (height - 40) / rows;
      const nodeWidth = 15;
      const nodeHeight = 30;

      // Position nodes in a grid
      graphData.nodes.forEach((node: any, i: number) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        node.x0 = 20 + col * cellWidth;
        node.y0 = 20 + row * cellHeight;
        node.x1 = node.x0 + nodeWidth;
        node.y1 = node.y0 + nodeHeight;
        node.value = 1;
        node.sourceLinks = [];
        node.targetLinks = [];
      });

      // Use the gridded data as sankeyData
      const sankeyData = { nodes: graphData.nodes, links: [] };

      // Draw nodes only (no links to draw)
      const node = g.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(sankeyData.nodes)
        .join('g')
        .attr('class', 'node');

      // Add node rectangles with category-aware coloring
      node.append('rect')
        .attr('x', (d: any) => d.x0)
        .attr('y', (d: any) => d.y0)
        .attr('height', (d: any) => d.y1 - d.y0)
        .attr('width', (d: any) => d.x1 - d.x0)
        .attr('fill', (d: any) => getNodeColor(d))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('rx', 2)
        .attr('ry', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', function(this: SVGRectElement, event: any, d: any) {
          setHoveredNode(d.id);
          if (onNodeHover) onNodeHover(d);
          d3.select(this).attr('stroke', '#fbbf24').attr('stroke-width', 3);
        })
        .on('mouseleave', function(this: SVGRectElement, event: any, d: any) {
          setHoveredNode(null);
          if (onNodeHover) onNodeHover(null);
          d3.select(this).attr('stroke', '#fff').attr('stroke-width', 2);
        })
        .on('click', function(this: SVGRectElement, event: any, d: any) {
          if (onNodeClick) onNodeClick(d);
        });

      // Add node labels with better positioning
      node.append('text')
        .attr('x', (d: any) => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr('y', (d: any) => (d.y1 + d.y0) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', (d: any) => d.x0 < width / 2 ? 'start' : 'end')
        .attr('font-size', '10px')
        .attr('fill', '#374151')
        .attr('class', 'dark:fill-gray-300')
        .style('pointer-events', 'none')
        .text((d: any) => {
          const maxLength = 20;
          return d.name.length > maxLength ? d.name.substring(0, maxLength) + '...' : d.name;
        });

      // Add tooltips for grid layout
      const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'sankey-tooltip-grid')
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', '#fff')
        .style('padding', '8px 12px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('z-index', 10000);

      node
        .on('mousemove', function(this: SVGGElement, event: any, d: any) {
          const category = d.metadata?.category || 'Unknown';
          const layer = PRIORITY_LAYERS[getNodePriority(d)] || 'Unknown Layer';

          tooltip
            .style('opacity', 1)
            .html(`
              <strong>${d.name}</strong><br/>
              <span style="color: ${getNodeColor(d)}">● </span>${d.type.replace('-', ' ')}<br/>
              Category: ${category}<br/>
              Layer: ${layer}
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          tooltip.style('opacity', 0);
        });

      return () => {
        tooltip.remove();
      };
    }

    // Generate sankey layout (when we have links)
    let sankeyData;
    try {
      sankeyData = sankeyGenerator(graphData as any);
      console.log('[SankeyDiagram] Layout computed successfully');

      // Validate layout output
      const hasInvalidPositions = sankeyData.nodes.some((n: any) =>
        isNaN(n.x0) || isNaN(n.y0) || isNaN(n.x1) || isNaN(n.y1)
      );

      if (hasInvalidPositions) {
        throw new Error('Layout produced NaN coordinates');
      }
    } catch (error) {
      console.error('[SankeyDiagram] Layout computation failed:', error);

      // Show error message in SVG
      g.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ef4444')
        .attr('font-size', '16px')
        .text('Unable to compute diagram layout. Check console for details.');

      return;
    }

    // Add layer header labels at the top
    const layerLabels = g.append('g')
      .attr('class', 'layer-labels');

    // Calculate layer positions from actual node positions
    const layerPositions: Record<number, { minX: number; maxX: number }> = {};
    sankeyData.nodes.forEach((n: any) => {
      const priority = getNodePriority(n);
      if (!layerPositions[priority]) {
        layerPositions[priority] = { minX: Infinity, maxX: -Infinity };
      }
      layerPositions[priority].minX = Math.min(layerPositions[priority].minX, n.x0);
      layerPositions[priority].maxX = Math.max(layerPositions[priority].maxX, n.x1);
    });

    // Draw layer headers
    Object.entries(layerPositions).forEach(([priorityStr, pos]) => {
      const priority = parseInt(priorityStr);
      const layerName = PRIORITY_LAYERS[priority] || `Layer ${priority}`;
      const centerX = (pos.minX + pos.maxX) / 2;

      layerLabels.append('text')
        .attr('x', centerX)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('fill', '#6b7280')
        .attr('class', 'dark:fill-gray-400')
        .text(layerName);

      // Add layer separator line
      if (priority < 4) {
        const nextPriority = priority + 1;
        const nextPos = layerPositions[nextPriority];
        if (nextPos) {
          const separatorX = (pos.maxX + nextPos.minX) / 2;
          layerLabels.append('line')
            .attr('x1', separatorX)
            .attr('y1', 35)
            .attr('x2', separatorX)
            .attr('y2', height - 20)
            .attr('stroke', '#e5e7eb')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4')
            .attr('class', 'dark:stroke-gray-700');
        }
      }
    });

    // Draw links (flows) with category-aware coloring
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(sankeyData.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d: any) => {
        // Use getNodeColor for source node to maintain category consistency
        const sourceNode = d.source as SankeyNode;
        return getNodeColor(sourceNode);
      })
      .attr('stroke-width', (d: any) => Math.max(1, d.width))
      .attr('fill', 'none')
      .attr('opacity', 0.3)
      .attr('class', 'link')
      .style('mix-blend-mode', 'multiply');

    // Add link hover effect
    link
      .on('mouseenter', function(this: SVGPathElement, event: any, d: any) {
        d3.select(this)
          .attr('opacity', 0.6)
          .attr('stroke-width', (d: any) => Math.max(2, d.width + 2));
      })
      .on('mouseleave', function(this: SVGPathElement) {
        d3.select(this)
          .attr('opacity', 0.3)
          .attr('stroke-width', (d: any) => Math.max(1, d.width));
      });

    // Draw nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(sankeyData.nodes)
      .join('g')
      .attr('class', 'node');

    // Add node rectangles with category-aware coloring
    node.append('rect')
      .attr('x', (d: any) => d.x0)
      .attr('y', (d: any) => d.y0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('fill', (d: any) => getNodeColor(d))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('rx', 2)
      .attr('ry', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function(this: SVGRectElement, event: any, d: any) {
        setHoveredNode(d.id);
        if (onNodeHover) onNodeHover(d);

        // Highlight connected links
        link.attr('opacity', (l: any) => {
          return (l.source.id === d.id || l.target.id === d.id) ? 0.6 : 0.1;
        });

        // Highlight node
        d3.select(this)
          .attr('stroke', '#fbbf24')
          .attr('stroke-width', 3);
      })
      .on('mouseleave', function(this: SVGRectElement, event: any, d: any) {
        setHoveredNode(null);
        if (onNodeHover) onNodeHover(null);

        // Reset link opacity
        link.attr('opacity', 0.3);

        // Reset node stroke
        d3.select(this)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      })
      .on('click', function(this: SVGRectElement, event: any, d: any) {
        if (onNodeClick) onNodeClick(d);
      });

    // Add node labels
    node.append('text')
      .attr('x', (d: any) => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', (d: any) => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: any) => d.x0 < width / 2 ? 'start' : 'end')
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .attr('class', 'dark:fill-gray-300')
      .style('pointer-events', 'none')
      .text((d: any) => {
        // Truncate long names
        const maxLength = 30;
        return d.name.length > maxLength ? d.name.substring(0, maxLength) + '...' : d.name;
      });

    // Add tooltips
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'sankey-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', '#fff')
      .style('padding', '8px 12px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 10000);

    node
      .on('mousemove', function(this: SVGGElement, event: any, d: any) {
        const category = d.metadata?.category || 'Unknown';
        const layer = PRIORITY_LAYERS[getNodePriority(d)] || 'Unknown Layer';
        const sourceFile = d.metadata?.sourceFile || '';

        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.name}</strong><br/>
            <span style="color: ${getNodeColor(d)}">● </span>${d.type.replace('-', ' ')}<br/>
            Category: ${category}<br/>
            Layer: ${layer}<br/>
            Connections: ${(d.sourceLinks?.length || 0) + (d.targetLinks?.length || 0)}
            ${sourceFile ? `<br/><span style="color: #9ca3af; font-size: 10px;">Source: ${sourceFile}</span>` : ''}
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.style('opacity', 0);
      });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };

  }, [nodes, links, width, height, onNodeClick, onNodeHover]);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold mb-2">No Data Available</p>
          <p className="text-sm">Run discovery modules to populate the organization map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      <svg ref={svgRef} className="w-full h-full" />

      {/* Enhanced Legend with Layers and Categories */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-y-auto">
        {/* Layers Section */}
        <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Layers (Left → Right)</h3>
        <div className="space-y-1 mb-4 pb-3 border-b border-gray-200 dark:border-gray-600">
          {Object.entries(PRIORITY_LAYERS).map(([priority, layerName]) => (
            <div key={priority} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                {priority}
              </div>
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {layerName}
              </span>
            </div>
          ))}
        </div>

        {/* Key Categories Section */}
        <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Categories</h3>
        <div className="space-y-1 grid grid-cols-2 gap-x-3">
          {Object.entries(CATEGORY_COLORS).slice(0, 16).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] text-gray-700 dark:text-gray-300 truncate max-w-[80px]" title={category}>
                {category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Tip:</strong> Hover over nodes to highlight connections. Click to view details. Scroll to zoom.
        </p>
      </div>
    </div>
  );
};
