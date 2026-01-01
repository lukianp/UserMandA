/**
 * TieredExplorer Component
 *
 * LeanIX-style column-based relations explorer.
 * Replaces the free-form Sankey diagram with a structured column layout.
 *
 * Features:
 * - Fixed-width columns with horizontal scroll
 * - Relation group pills (expandable)
 * - Entity lists within expanded groups
 * - Active branch highlighting with curved links
 * - Click to expand/select, truncates columns to the right
 */

import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import {
  ExplorerState,
  ExplorerColumn,
  ExplorerNode,
  RelationGroup,
  RELATION_GROUP_COLORS
} from '../../types/models/tieredExplorerTypes';
import { EntityType } from '../../types/models/organisation';

export interface TieredExplorerProps {
  explorerState: ExplorerState;
  onRelationGroupClick: (columnIndex: number, relationGroupKey: string) => void;
  onEntityClick: (columnIndex: number, entityId: string) => void;
  onEntityDoubleClick?: (entityId: string) => void;
  width?: number;
  height?: number;
}

// Layout constants
const COLUMN_WIDTH = 280;
const COLUMN_GAP = 60;
const COLUMN_PADDING = 16;
const ITEM_HEIGHT = 44;
const ITEM_GAP = 8;
const HEADER_HEIGHT = 40;
const PILL_RADIUS = 22;

// Entity type colors (matching existing scheme)
const TYPE_COLORS: Record<EntityType, string> = {
  'company': '#3b82f6',
  'platform': '#8b5cf6',
  'application': '#10b981',
  'datacenter': '#f59e0b',
  'provider-interface': '#06b6d4',
  'consumer-interface': '#ec4899',
  'business-capability': '#6366f1',
  'it-component': '#84cc16',
  'user': '#0ea5e9',
  'group': '#a855f7',
  'mailbox': '#f97316',
  'license': '#22c55e',
  'subscription': '#eab308',
  'resource-group': '#14b8a6'
};

/**
 * Get color for a relation group
 */
function getRelationGroupColor(key: string): string {
  return RELATION_GROUP_COLORS[key] || RELATION_GROUP_COLORS['default'];
}

/**
 * Get color for an entity type
 */
function getEntityColor(type: EntityType): string {
  return TYPE_COLORS[type] || '#6b7280';
}

/**
 * Truncate text to fit width
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 2) + '...';
}

export const TieredExplorer: React.FC<TieredExplorerProps> = ({
  explorerState,
  onRelationGroupClick,
  onEntityClick,
  onEntityDoubleClick,
  width = 1400,
  height = 700
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate total width based on columns
  const totalWidth = useMemo(() => {
    return Math.max(
      width,
      explorerState.columns.length * (COLUMN_WIDTH + COLUMN_GAP) + COLUMN_GAP
    );
  }, [explorerState.columns.length, width]);

  useEffect(() => {
    if (!svgRef.current || explorerState.columns.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Main group with margin
    const g = svg.append('g')
      .attr('transform', `translate(${COLUMN_GAP / 2}, 20)`);

    // Render each column
    explorerState.columns.forEach((column, columnIndex) => {
      const columnX = columnIndex * (COLUMN_WIDTH + COLUMN_GAP);
      const columnGroup = g.append('g')
        .attr('class', `column-${columnIndex}`)
        .attr('transform', `translate(${columnX}, 0)`);

      // Column background
      columnGroup.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', COLUMN_WIDTH)
        .attr('height', height - 40)
        .attr('fill', '#f8fafc')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1)
        .attr('rx', 12);

      // Column header
      const headerText = column.type === 'entity' ? 'Selected Entity' :
                        column.type === 'relationGroups' ? 'Relations' : 'Entities';

      columnGroup.append('text')
        .attr('x', COLUMN_PADDING)
        .attr('y', 28)
        .attr('fill', '#64748b')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .attr('text-transform', 'uppercase')
        .attr('letter-spacing', '0.05em')
        .text(headerText);

      // Render items
      const itemsGroup = columnGroup.append('g')
        .attr('transform', `translate(0, ${HEADER_HEIGHT})`);

      if (column.type === 'relationGroups') {
        renderRelationGroups(
          itemsGroup,
          column.items as RelationGroup[],
          column.selectedItemId,
          columnIndex,
          onRelationGroupClick
        );
      } else {
        renderEntities(
          itemsGroup,
          column.items as ExplorerNode[],
          column.selectedItemId,
          columnIndex,
          onEntityClick,
          onEntityDoubleClick
        );
      }
    });

    // Render links between columns
    renderLinks(g, explorerState.columns, height);

  }, [explorerState, width, height, onRelationGroupClick, onEntityClick, onEntityDoubleClick]);

  // Auto-scroll to show latest column
  useEffect(() => {
    if (containerRef.current && explorerState.columns.length > 3) {
      const scrollX = (explorerState.columns.length - 3) * (COLUMN_WIDTH + COLUMN_GAP);
      containerRef.current.scrollTo({ left: scrollX, behavior: 'smooth' });
    }
  }, [explorerState.columns.length]);

  if (explorerState.columns.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg font-semibold mb-2">No Entity Selected</p>
          <p className="text-sm">Select an entity to explore its relations.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-x-auto overflow-y-hidden bg-gray-50 dark:bg-gray-900"
    >
      <svg
        ref={svgRef}
        width={totalWidth}
        height={height}
        className="min-w-full"
      />
    </div>
  );
};

/**
 * Render relation group pills
 */
function renderRelationGroups(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  items: RelationGroup[],
  selectedId: string | undefined,
  columnIndex: number,
  onClick: (columnIndex: number, key: string) => void
) {
  items.forEach((item, index) => {
    const y = index * (ITEM_HEIGHT + ITEM_GAP);
    const isSelected = selectedId === item.key;
    const color = getRelationGroupColor(item.key);

    const itemGroup = g.append('g')
      .attr('transform', `translate(${COLUMN_PADDING}, ${y})`)
      .attr('class', 'relation-group')
      .style('cursor', 'pointer');

    // Pill background
    itemGroup.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', COLUMN_WIDTH - COLUMN_PADDING * 2)
      .attr('height', ITEM_HEIGHT)
      .attr('fill', isSelected ? color : '#ffffff')
      .attr('stroke', color)
      .attr('stroke-width', isSelected ? 3 : 2)
      .attr('rx', PILL_RADIUS)
      .on('mouseenter', function() {
        if (!isSelected) {
          d3.select(this).attr('fill', `${color}15`);
        }
      })
      .on('mouseleave', function() {
        if (!isSelected) {
          d3.select(this).attr('fill', '#ffffff');
        }
      })
      .on('click', () => onClick(columnIndex, item.key));

    // Icon circle
    itemGroup.append('circle')
      .attr('cx', 24)
      .attr('cy', ITEM_HEIGHT / 2)
      .attr('r', 14)
      .attr('fill', isSelected ? 'rgba(255,255,255,0.3)' : `${color}20`)
      .on('click', () => onClick(columnIndex, item.key));

    // Label
    itemGroup.append('text')
      .attr('x', 48)
      .attr('y', ITEM_HEIGHT / 2)
      .attr('dy', '0.35em')
      .attr('fill', isSelected ? '#ffffff' : '#374151')
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .text(truncateText(item.label, 22))
      .on('click', () => onClick(columnIndex, item.key));

    // Count badge
    itemGroup.append('text')
      .attr('x', COLUMN_WIDTH - COLUMN_PADDING * 2 - 16)
      .attr('y', ITEM_HEIGHT / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', isSelected ? 'rgba(255,255,255,0.9)' : '#6b7280')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .text(item.count.toString())
      .on('click', () => onClick(columnIndex, item.key));

    // Arrow indicator for selected
    if (isSelected) {
      itemGroup.append('text')
        .attr('x', COLUMN_WIDTH - COLUMN_PADDING * 2 - 4)
        .attr('y', ITEM_HEIGHT / 2)
        .attr('dy', '0.35em')
        .attr('fill', '#ffffff')
        .attr('font-size', '16px')
        .text('›');
    }
  });
}

/**
 * Render entity items
 */
function renderEntities(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  items: ExplorerNode[],
  selectedId: string | undefined,
  columnIndex: number,
  onClick: (columnIndex: number, id: string) => void,
  onDoubleClick?: (id: string) => void
) {
  items.forEach((item, index) => {
    const y = index * (ITEM_HEIGHT + ITEM_GAP);
    const isSelected = selectedId === item.id;
    const color = getEntityColor(item.factSheetType);

    const itemGroup = g.append('g')
      .attr('transform', `translate(${COLUMN_PADDING}, ${y})`)
      .attr('class', 'entity-item')
      .style('cursor', 'pointer');

    // Background
    itemGroup.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', COLUMN_WIDTH - COLUMN_PADDING * 2)
      .attr('height', ITEM_HEIGHT)
      .attr('fill', isSelected ? '#dbeafe' : '#ffffff')
      .attr('stroke', isSelected ? '#3b82f6' : '#e2e8f0')
      .attr('stroke-width', isSelected ? 2 : 1)
      .attr('rx', 8)
      .on('mouseenter', function() {
        if (!isSelected) {
          d3.select(this).attr('fill', '#f1f5f9');
        }
      })
      .on('mouseleave', function() {
        if (!isSelected) {
          d3.select(this).attr('fill', '#ffffff');
        }
      })
      .on('click', () => onClick(columnIndex, item.id))
      .on('dblclick', () => onDoubleClick?.(item.id));

    // Type indicator dot
    itemGroup.append('circle')
      .attr('cx', 20)
      .attr('cy', ITEM_HEIGHT / 2)
      .attr('r', 10)
      .attr('fill', color)
      .on('click', () => onClick(columnIndex, item.id));

    // Label
    itemGroup.append('text')
      .attr('x', 40)
      .attr('y', ITEM_HEIGHT / 2 - 4)
      .attr('dy', '0.35em')
      .attr('fill', '#1f2937')
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .text(truncateText(item.label, 26))
      .on('click', () => onClick(columnIndex, item.id));

    // Category/type subtitle
    itemGroup.append('text')
      .attr('x', 40)
      .attr('y', ITEM_HEIGHT / 2 + 10)
      .attr('dy', '0.35em')
      .attr('fill', '#6b7280')
      .attr('font-size', '11px')
      .text(item.category || item.factSheetType.replace('-', ' '))
      .on('click', () => onClick(columnIndex, item.id));

    // Arrow for selected
    if (isSelected) {
      itemGroup.append('text')
        .attr('x', COLUMN_WIDTH - COLUMN_PADDING * 2 - 8)
        .attr('y', ITEM_HEIGHT / 2)
        .attr('dy', '0.35em')
        .attr('fill', '#3b82f6')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .text('›');
    }
  });
}

/**
 * Render curved links between columns
 */
function renderLinks(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  columns: ExplorerColumn[],
  height: number
) {
  const linksGroup = g.append('g').attr('class', 'links').lower();

  for (let i = 0; i < columns.length - 1; i++) {
    const sourceColumn = columns[i];
    const targetColumn = columns[i + 1];

    if (!sourceColumn.selectedItemId) continue;

    // Find selected item's position
    const selectedIndex = sourceColumn.items.findIndex(item => {
      if (sourceColumn.type === 'relationGroups') {
        return (item as RelationGroup).key === sourceColumn.selectedItemId;
      }
      return (item as ExplorerNode).id === sourceColumn.selectedItemId;
    });

    if (selectedIndex === -1) continue;

    const sourceX = i * (COLUMN_WIDTH + COLUMN_GAP) + COLUMN_WIDTH;
    const targetX = (i + 1) * (COLUMN_WIDTH + COLUMN_GAP);
    const sourceY = HEADER_HEIGHT + selectedIndex * (ITEM_HEIGHT + ITEM_GAP) + ITEM_HEIGHT / 2;

    // Draw link to each item in target column (fan out)
    const targetItems = targetColumn.items;
    targetItems.forEach((_, targetIndex) => {
      const targetY = HEADER_HEIGHT + targetIndex * (ITEM_HEIGHT + ITEM_GAP) + ITEM_HEIGHT / 2;

      // Curved bezier path
      const midX = (sourceX + targetX) / 2;
      const path = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;

      linksGroup.append('path')
        .attr('d', path)
        .attr('stroke', '#93c5fd')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('opacity', 0.6);
    });

    // Draw active link (thicker, highlighted)
    if (targetColumn.items.length > 0) {
      const firstTargetY = HEADER_HEIGHT + ITEM_HEIGHT / 2;
      const midX = (sourceX + targetX) / 2;
      const activePath = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${firstTargetY}, ${targetX} ${firstTargetY}`;

      linksGroup.append('path')
        .attr('d', activePath)
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 3)
        .attr('fill', 'none');
    }
  }
}

export default TieredExplorer;


