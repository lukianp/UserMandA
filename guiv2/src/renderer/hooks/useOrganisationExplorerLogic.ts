/**
 * useOrganisationExplorerLogic Hook
 *
 * State management and data population for the tiered relations explorer.
 * Converts existing SankeyNode/SankeyLink data into column-based explorer state.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  ExplorerState,
  ExplorerColumn,
  ExplorerNode,
  RelationGroup,
  BreadcrumbItem,
  RELATION_GROUP_COLORS,
  getGroupKeyForNode
} from '../types/models/tieredExplorerTypes';
import { SankeyNode, SankeyLink, EntityType, RelationType } from '../types/models/organisation';

interface UseOrganisationExplorerLogicProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

interface UseOrganisationExplorerLogicReturn {
  explorerState: ExplorerState;
  initializeWithEntity: (entityId: string) => void;
  selectRelationGroup: (columnIndex: number, relationGroupKey: string) => void;
  selectEntity: (columnIndex: number, entityId: string) => void;
  focusOnEntity: (entityId: string) => void;
  goToBreadcrumb: (columnIndex: number) => void;
  getSelectedEntity: () => SankeyNode | null;
  closeDetailPanel: () => void;
}

/**
 * Group label mappings for better display
 */
const GROUP_LABELS: Record<string, string> = {
  'applications': 'Applications',
  'it-components': 'IT Components',
  'platforms': 'Platforms & Services',
  'infrastructure': 'Infrastructure',
  'users': 'Users & People',
  'groups': 'Groups & Teams',
  'business-capabilities': 'Business Capabilities',
  'interfaces': 'Interfaces & APIs',
  'company': 'Organizations',
  'default': 'Other Relations'
};

/**
 * Main hook export
 */
export const useOrganisationExplorerLogic = ({
  nodes,
  links
}: UseOrganisationExplorerLogicProps): UseOrganisationExplorerLogicReturn => {

  const [explorerState, setExplorerState] = useState<ExplorerState>({
    rootEntityId: '',
    columns: [],
    selectedEntityId: undefined,
    breadcrumb: [],
    detailPanelOpen: false
  });

  // Create node lookup map for fast access
  const nodeMap = useMemo(() => {
    const map = new Map<string, SankeyNode>();
    nodes.forEach(node => map.set(node.id, node));
    return map;
  }, [nodes]);

  // Create adjacency lists for relationships
  const relationships = useMemo(() => {
    const outgoing = new Map<string, { targetId: string; type: RelationType }[]>();
    const incoming = new Map<string, { sourceId: string; type: RelationType }[]>();

    console.log('[Explorer] Building relationships from', links.length, 'links');

    links.forEach((link, idx) => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;

      if (idx < 5) {
        console.log('[Explorer] Link sample:', { sourceId, targetId, type: link.type });
      }

      if (!outgoing.has(sourceId)) outgoing.set(sourceId, []);
      outgoing.get(sourceId)!.push({ targetId, type: link.type });

      if (!incoming.has(targetId)) incoming.set(targetId, []);
      incoming.get(targetId)!.push({ sourceId, type: link.type });
    });

    console.log('[Explorer] Built relationship maps:', {
      outgoingEntityCount: outgoing.size,
      incomingEntityCount: incoming.size
    });

    // Log sample node IDs to compare
    const nodeIds = Array.from(nodeMap.keys()).slice(0, 5);
    console.log('[Explorer] Sample node IDs:', nodeIds);

    return { outgoing, incoming };
  }, [links, nodeMap]);

  /**
   * Get related entities for a given entity
   */
  const getRelatedEntities = useCallback((entityId: string): SankeyNode[] => {
    const related: SankeyNode[] = [];
    const seenIds = new Set<string>();

    // Outgoing relationships
    const outgoingRels = relationships.outgoing.get(entityId) || [];
    outgoingRels.forEach(rel => {
      if (!seenIds.has(rel.targetId)) {
        const node = nodeMap.get(rel.targetId);
        if (node) {
          related.push(node);
          seenIds.add(rel.targetId);
        }
      }
    });

    // Incoming relationships
    const incomingRels = relationships.incoming.get(entityId) || [];
    incomingRels.forEach(rel => {
      if (!seenIds.has(rel.sourceId)) {
        const node = nodeMap.get(rel.sourceId);
        if (node) {
          related.push(node);
          seenIds.add(rel.sourceId);
        }
      }
    });

    if (related.length === 0) {
      console.log('[Explorer] No relations found for entity:', entityId);
      console.log('[Explorer] Outgoing rels:', outgoingRels.length, 'Incoming rels:', incomingRels.length);
    }

    return related;
  }, [nodeMap, relationships]);

  /**
   * Build relation groups from related entities
   * Uses category-aware grouping to properly classify Users, Groups, etc.
   */
  const buildRelationGroups = useCallback((entityId: string): RelationGroup[] => {
    const relatedEntities = getRelatedEntities(entityId);
    const groupMap = new Map<string, { nodes: SankeyNode[]; relationType: RelationType }>();

    relatedEntities.forEach(node => {
      // Use category-aware grouping (Users -> 'users', Groups -> 'groups', etc.)
      const groupKey = getGroupKeyForNode(node.type, node.metadata?.category);

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, { nodes: [], relationType: 'dependency' });
      }
      groupMap.get(groupKey)!.nodes.push(node);
    });

    // Debug: Log group distribution
    console.log('[Explorer] Relation groups for entity:', entityId,
      Array.from(groupMap.entries()).map(([key, data]) => `${key}: ${data.nodes.length}`));

    // Convert to RelationGroup array
    const groups: RelationGroup[] = [];
    groupMap.forEach((data, key) => {
      groups.push({
        key,
        label: GROUP_LABELS[key] || key,
        relationType: data.relationType,
        count: data.nodes.length,
        colorKey: RELATION_GROUP_COLORS[key] || RELATION_GROUP_COLORS['default'],
        entityIds: data.nodes.map(n => n.id)
      });
    });

    // Sort by count descending
    groups.sort((a, b) => b.count - a.count);

    return groups;
  }, [getRelatedEntities]);

  /**
   * Convert SankeyNodes to ExplorerNodes
   */
  const toExplorerNodes = useCallback((sankeyNodes: SankeyNode[]): ExplorerNode[] => {
    return sankeyNodes.map(node => ({
      id: node.id,
      label: node.name,
      factSheetType: node.type,
      category: node.metadata?.category,
      sourceNode: node
    }));
  }, []);

  /**
   * Initialize explorer with a root entity
   */
  const initializeWithEntity = useCallback((entityId: string) => {
    const entity = nodeMap.get(entityId);
    if (!entity) {
      console.warn('[Explorer] Entity not found:', entityId);
      return;
    }

    // Create initial entity column
    const entityColumn: ExplorerColumn = {
      id: `col-entity-${entityId}`,
      type: 'entity',
      parentEntityId: '',
      selectedItemId: entityId,
      items: [toExplorerNodes([entity])[0]]
    };

    // Create relation groups column
    const relationGroups = buildRelationGroups(entityId);
    const relationGroupsColumn: ExplorerColumn = {
      id: `col-relations-${entityId}`,
      type: 'relationGroups',
      parentEntityId: entityId,
      items: relationGroups
    };

    const breadcrumb: BreadcrumbItem = {
      id: entityId,
      label: entity.name,
      type: entity.type,
      columnIndex: 0
    };

    setExplorerState({
      rootEntityId: entityId,
      columns: [entityColumn, relationGroupsColumn],
      selectedEntityId: entityId,
      breadcrumb: [breadcrumb],
      detailPanelOpen: true
    });

    console.log('[Explorer] Initialized with entity:', entity.name, 'Relations:', relationGroups.length);
  }, [nodeMap, buildRelationGroups, toExplorerNodes]);

  /**
   * Select a relation group - expands to show entities in that group
   */
  const selectRelationGroup = useCallback((columnIndex: number, relationGroupKey: string) => {
    setExplorerState(prev => {
      // Truncate columns after this one
      const newColumns = prev.columns.slice(0, columnIndex + 1);

      // Update selected item in this column
      const currentColumn = { ...newColumns[columnIndex] };
      currentColumn.selectedItemId = relationGroupKey;
      newColumns[columnIndex] = currentColumn;

      // Find the relation group
      const relationGroup = (currentColumn.items as RelationGroup[])
        .find(rg => rg.key === relationGroupKey);

      if (!relationGroup) return prev;

      // Get entities for this group
      const entityNodes = relationGroup.entityIds
        .map(id => nodeMap.get(id))
        .filter((n): n is SankeyNode => n !== undefined);

      // Create entities column
      const entitiesColumn: ExplorerColumn = {
        id: `col-entities-${relationGroupKey}-${Date.now()}`,
        type: 'entities',
        parentEntityId: currentColumn.parentEntityId,
        parentRelationGroup: relationGroupKey,
        items: toExplorerNodes(entityNodes)
      };

      newColumns.push(entitiesColumn);

      return {
        ...prev,
        columns: newColumns
      };
    });
  }, [nodeMap, toExplorerNodes]);

  /**
   * Select an entity - shows its relation groups
   */
  const selectEntity = useCallback((columnIndex: number, entityId: string) => {
    const entity = nodeMap.get(entityId);
    if (!entity) return;

    setExplorerState(prev => {
      // Truncate columns after this one
      const newColumns = prev.columns.slice(0, columnIndex + 1);

      // Update selected item in this column
      const currentColumn = { ...newColumns[columnIndex] };
      currentColumn.selectedItemId = entityId;
      newColumns[columnIndex] = currentColumn;

      // Build relation groups for this entity
      const relationGroups = buildRelationGroups(entityId);

      // Only add relation groups column if there are relations
      if (relationGroups.length > 0) {
        const relationGroupsColumn: ExplorerColumn = {
          id: `col-relations-${entityId}-${Date.now()}`,
          type: 'relationGroups',
          parentEntityId: entityId,
          items: relationGroups
        };
        newColumns.push(relationGroupsColumn);
      }

      // Update breadcrumb
      const newBreadcrumb = prev.breadcrumb.slice(0, Math.floor(columnIndex / 2) + 1);
      newBreadcrumb.push({
        id: entityId,
        label: entity.name,
        type: entity.type,
        columnIndex: newColumns.length - 1
      });

      return {
        ...prev,
        columns: newColumns,
        selectedEntityId: entityId,
        breadcrumb: newBreadcrumb,
        detailPanelOpen: true
      };
    });
  }, [nodeMap, buildRelationGroups]);

  /**
   * Focus on entity - makes it the new root
   */
  const focusOnEntity = useCallback((entityId: string) => {
    initializeWithEntity(entityId);
  }, [initializeWithEntity]);

  /**
   * Navigate to breadcrumb item
   */
  const goToBreadcrumb = useCallback((columnIndex: number) => {
    setExplorerState(prev => {
      // Truncate to that column
      const newColumns = prev.columns.slice(0, columnIndex + 2); // Keep entity + relations
      const newBreadcrumb = prev.breadcrumb.filter(b => b.columnIndex <= columnIndex);

      const lastBreadcrumb = newBreadcrumb[newBreadcrumb.length - 1];

      return {
        ...prev,
        columns: newColumns,
        breadcrumb: newBreadcrumb,
        selectedEntityId: lastBreadcrumb?.id
      };
    });
  }, []);

  /**
   * Get the currently selected entity
   */
  const getSelectedEntity = useCallback((): SankeyNode | null => {
    if (!explorerState.selectedEntityId) return null;
    return nodeMap.get(explorerState.selectedEntityId) || null;
  }, [explorerState.selectedEntityId, nodeMap]);

  /**
   * Close the detail panel
   */
  const closeDetailPanel = useCallback(() => {
    setExplorerState(prev => ({
      ...prev,
      detailPanelOpen: false
    }));
  }, []);

  return {
    explorerState,
    initializeWithEntity,
    selectRelationGroup,
    selectEntity,
    focusOnEntity,
    goToBreadcrumb,
    getSelectedEntity,
    closeDetailPanel
  };
};

export default useOrganisationExplorerLogic;
