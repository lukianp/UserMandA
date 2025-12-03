/**
 * SankeyDiagram Component
 *
 * Interactive D3.js-powered Sankey diagram for Organization Map visualization.
 * Displays hierarchical relationships between entities with flow-based layout.
 */

import React, { useEffect, useRef, useState } from 'react';
// @ts-expect-error - d3 types not installed, runtime functionality works
import * as d3 from 'd3';
// @ts-expect-error - d3-sankey types not installed, runtime functionality works
import { sankey, sankeyLinkHorizontal, SankeyNode as D3SankeyNode, SankeyLink as D3SankeyLink } from 'd3-sankey';
import { SankeyNode, SankeyLink, EntityType } from '../../types/models/organisation';

export interface SankeyDiagramProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  width?: number;
  height?: number;
  onNodeClick?: (node: SankeyNode) => void;
  onNodeHover?: (node: SankeyNode | null) => void;
}

// Type color mapping for entities
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

export const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
  nodes,
  links,
  width = 1200,
  height = 600,
  onNodeClick,
  onNodeHover,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    console.log('[SankeyDiagram] Rendering:', { nodes: nodes.length, links: links.length });

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

    // Prepare data for d3-sankey
    const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
      .nodeId((d: any) => d.id)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 1], [width - 1, height - 6]]);

    // Create a copy of the data for d3-sankey (it mutates the objects)
    const graphData = {
      nodes: nodes.map(n => ({ ...n })),
      links: links.map(l => ({ ...l }))
    };

    // Generate sankey layout
    let sankeyData;
    try {
      sankeyData = sankeyGenerator(graphData as any);
      console.log('[SankeyDiagram] Layout computed successfully');
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

    // Draw links (flows)
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(sankeyData.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d: any) => {
        const sourceNode = d.source as SankeyNode;
        return TYPE_COLORS[sourceNode.type as EntityType] || '#9ca3af';
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

    // Add node rectangles
    node.append('rect')
      .attr('x', (d: any) => d.x0)
      .attr('y', (d: any) => d.y0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('fill', (d: any) => TYPE_COLORS[d.type as EntityType] || '#6b7280')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
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
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.name}</strong><br/>
            Type: ${d.type}<br/>
            Connections: ${(d.sourceLinks?.length || 0) + (d.targetLinks?.length || 0)}
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

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Entity Types</h3>
        <div className="space-y-1">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                {type.replace('-', ' ')}
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
