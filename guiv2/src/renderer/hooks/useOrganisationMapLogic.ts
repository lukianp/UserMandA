/**
 * useOrganisationMapLogic Hook
 *
 * Data aggregation logic for Organisation Map feature.
 * Reads all CSV files from discovery modules and constructs Sankey diagram data.
 */

import { useState, useEffect, useMemo } from 'react';
import { SankeyNode, SankeyLink, EntityType, FactSheetData, OrganisationMapData } from '../types/models/organisation';

interface UseOrganisationMapLogicReturn {
  data: OrganisationMapData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useOrganisationMapLogic = (): UseOrganisationMapLogicReturn => {
  const [data, setData] = useState<OrganisationMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useOrganisationMapLogic] Starting data fetch...');

      // Get all CSV files from discovery data
      const csvFiles = await window.electronAPI.invoke('get-discovery-files');
      console.log('[useOrganisationMapLogic] Found CSV files:', csvFiles.length);

      // Process each CSV file
      const allNodes: SankeyNode[] = [];
      const allLinks: SankeyLink[] = [];

      for (const file of csvFiles) {
        console.log('[useOrganisationMapLogic] Processing file:', file.path, 'Type:', file.type);

        try {
          const content = await window.electronAPI.invoke('read-discovery-file', file.path);
          const fileNodes = parseCSVToNodes(content, file.type);
          const fileLinks = generateLinksForFile(fileNodes, file.type);

          console.log('[useOrganisationMapLogic] File parsed:', {
            path: file.path,
            nodes: fileNodes.length,
            links: fileLinks.length
          });

          allNodes.push(...fileNodes);
          allLinks.push(...fileLinks);
        } catch (fileError) {
          console.warn('[useOrganisationMapLogic] Failed to process file:', file.path, fileError);
        }
      }

      console.log('[useOrganisationMapLogic] Total before merge:', {
        nodes: allNodes.length,
        links: allLinks.length
      });

      // Merge duplicate nodes and links
      const mergedData = mergeDuplicateEntities(allNodes, allLinks);

      console.log('[useOrganisationMapLogic] Total after merge:', {
        nodes: mergedData.nodes.length,
        links: mergedData.links.length
      });

      setData(mergedData);
    } catch (err) {
      console.error('[useOrganisationMapLogic] Error fetching organisation map data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};

/**
 * Parse CSV content to SankeyNode array
 */
function parseCSVToNodes(csvContent: string, fileType: string): SankeyNode[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1);

  const nodes: SankeyNode[] = [];

  rows.forEach((row, index) => {
    const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
    const record: any = {};
    headers.forEach((header, i) => {
      record[header] = values[i] || '';
    });

    const node = createNodeFromRecord(record, fileType, index);
    if (node) {
      nodes.push(node);
    }
  });

  return nodes.filter(Boolean);
}

/**
 * Create SankeyNode from CSV record
 * CRITICAL: Use PascalCase property names to match PowerShell output
 * Works with actual discovery data (Users, Groups, Devices, Mailboxes, etc.)
 */
function createNodeFromRecord(record: any, fileType: string, index: number): SankeyNode | null {
  // Map file types to entity types and extract relevant fields
  const typeMapping: Record<string, { type: EntityType, getName: (r: any) => string | null }> = {
    'user': {
      type: 'application' as EntityType, // Users as applications for visualization
      getName: (r) => r.DisplayName || r.UserPrincipalName || r.SamAccountName || r.Name
    },
    'group': {
      type: 'platform' as EntityType, // Groups as platforms
      getName: (r) => r.DisplayName || r.Name || r.GroupName
    },
    'mailbox': {
      type: 'application' as EntityType,
      getName: (r) => r.DisplayName || r.PrimarySmtpAddress || r.Name
    },
    'device': {
      type: 'it-component' as EntityType,
      getName: (r) => r.Name || r.ComputerName || r.DeviceName || r.DisplayName
    },
    'server': {
      type: 'it-component' as EntityType,
      getName: (r) => r.Name || r.ServerName || r.ComputerName
    },
    'application': {
      type: 'application' as EntityType,
      getName: (r) => r.Name || r.DisplayName || r.ApplicationName
    },
    'infrastructure': {
      type: 'datacenter' as EntityType,
      getName: (r) => r.Name || r.DisplayName
    }
  };

  const mapping = typeMapping[fileType.toLowerCase()];
  if (!mapping) {
    // Unknown type, skip
    return null;
  }

  const name = mapping.getName(record);
  if (!name || name.trim() === '') {
    return null;
  }

  const nodeType = mapping.type;
  const uniqueId = `${nodeType}-${name}-${index}`;

  return {
    id: uniqueId,
    name: name,
    type: nodeType,
    factSheet: createFactSheet(record, nodeType),
    metadata: { source: fileType, record }
  };
}

/**
 * Create FactSheet from CSV record
 * CRITICAL: Use PascalCase property names
 */
function createFactSheet(record: any, type: EntityType): FactSheetData {
  return {
    baseInfo: {
      name: record.Name || record.DisplayName || record.ApplicationName || 'Unknown',
      type,
      description: record.Description || '',
      owner: record.Owner || record.ManagerDisplayName || '',
      status: (record.Status || 'active').toLowerCase() as any
    },
    relations: {
      incoming: [],
      outgoing: []
    },
    itComponents: [],
    subscriptions: [],
    comments: [],
    todos: [],
    resources: [],
    metrics: [],
    surveys: [],
    lastUpdate: new Date(record.LastModified || record.CreatedDateTime || Date.now())
  };
}

/**
 * Generate links between nodes based on hierarchical relationships
 * Works with actual discovery data relationships (users→groups, devices→servers, etc.)
 */
function generateLinksForFile(nodes: SankeyNode[], fileType: string): SankeyLink[] {
  const links: SankeyLink[] = [];

  // Create relationships based on discovered data
  nodes.forEach(node => {
    const record = node.metadata.record;

    // Link users to groups they belong to
    if (fileType.toLowerCase() === 'user' && record.Groups) {
      const groups = Array.isArray(record.Groups) ? record.Groups : [record.Groups];
      groups.forEach((groupName: string) => {
        if (groupName && groupName.trim()) {
          // Find matching group node
          const groupNode = nodes.find(n => n.type === 'platform' && n.name === groupName);
          if (groupNode) {
            links.push({
              source: groupNode.id,
              target: node.id,
              value: 1,
              type: 'membership'
            });
          }
        }
      });
    }

    // Link mailboxes to users (by matching names/UPNs)
    if (fileType.toLowerCase() === 'mailbox' && record.UserPrincipalName) {
      const userNode = nodes.find(n =>
        n.type === 'application' &&
        (n.metadata.record.UserPrincipalName === record.UserPrincipalName ||
         n.metadata.record.DisplayName === record.DisplayName)
      );
      if (userNode) {
        links.push({
          source: userNode.id,
          target: node.id,
          value: 1,
          type: 'ownership'
        });
      }
    }

    // Link devices to servers or infrastructure
    if (fileType.toLowerCase() === 'device' && record.ServerName) {
      const serverNode = nodes.find(n =>
        n.type === 'it-component' && n.name === record.ServerName
      );
      if (serverNode) {
        links.push({
          source: serverNode.id,
          target: node.id,
          value: 1,
          type: 'deployment'
        });
      }
    }
  });

  return links;
}

/**
 * Merge duplicate nodes and links
 */
function mergeDuplicateEntities(nodes: SankeyNode[], links: SankeyLink[]): OrganisationMapData {
  // Remove duplicate nodes by ID
  const uniqueNodes = nodes.reduce((acc, node) => {
    if (!acc.find(n => n.id === node.id)) {
      acc.push(node);
    }
    return acc;
  }, [] as SankeyNode[]);

  // Remove duplicate links
  const uniqueLinks = links.reduce((acc, link) => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

    if (!acc.find(l => {
      const lSourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const lTargetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
      return lSourceId === sourceId && lTargetId === targetId;
    })) {
      acc.push(link);
    }
    return acc;
  }, [] as SankeyLink[]);

  return { nodes: uniqueNodes, links: uniqueLinks };
}
