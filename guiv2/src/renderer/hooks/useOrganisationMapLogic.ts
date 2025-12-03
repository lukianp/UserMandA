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
 */
function createNodeFromRecord(record: any, fileType: string, index: number): SankeyNode | null {
  // Extract company from CompanyName field
  if (record.CompanyName && !record.company_processed) {
    return {
      id: `company-${record.CompanyName}`,
      name: record.CompanyName,
      type: 'company',
      factSheet: createFactSheet(record, 'company'),
      metadata: { source: fileType, record }
    };
  }

  // Extract platforms from application data (L3 platforms)
  if (record.Platform && !record.platform_processed) {
    return {
      id: `platform-${record.Platform}`,
      name: record.Platform,
      type: 'platform',
      factSheet: createFactSheet(record, 'platform'),
      metadata: { source: fileType, record }
    };
  }

  // Extract applications
  if (record.ApplicationName || record.Name) {
    const appName = record.ApplicationName || record.Name;
    return {
      id: `application-${appName}`,
      name: appName,
      type: 'application',
      factSheet: createFactSheet(record, 'application'),
      metadata: { source: fileType, record }
    };
  }

  // Extract data centers
  if (record.DataCenter || record.LocationType === 'datacenter') {
    return {
      id: `datacenter-${record.DataCenter || record.Name}`,
      name: record.DataCenter || record.Name,
      type: 'datacenter',
      factSheet: createFactSheet(record, 'datacenter'),
      metadata: { source: fileType, record }
    };
  }

  // Extract interfaces from Exchange/SharePoint data
  if (record.InterfaceType || record.ConnectionType) {
    const interfaceType = record.InterfaceType === 'provider' ? 'provider-interface' : 'consumer-interface';
    return {
      id: `interface-${record.Name || index}`,
      name: record.Name || `Interface ${index}`,
      type: interfaceType as EntityType,
      factSheet: createFactSheet(record, interfaceType as EntityType),
      metadata: { source: fileType, record }
    };
  }

  return null;
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
 */
function generateLinksForFile(nodes: SankeyNode[], fileType: string): SankeyLink[] {
  const links: SankeyLink[] = [];

  // Create hierarchical links based on LeanIX structure
  nodes.forEach(node => {
    switch (node.type) {
      case 'application':
        // Link applications to their platforms
        if (node.metadata.record.Platform) {
          links.push({
            source: `platform-${node.metadata.record.Platform}`,
            target: node.id,
            value: 1,
            type: 'ownership'
          });
        }
        // Link applications to data centers
        if (node.metadata.record.DataCenter) {
          links.push({
            source: node.id,
            target: `datacenter-${node.metadata.record.DataCenter}`,
            value: 1,
            type: 'deployment'
          });
        }
        break;

      case 'platform':
        // Link platforms to companies
        if (node.metadata.record.CompanyName) {
          links.push({
            source: `company-${node.metadata.record.CompanyName}`,
            target: node.id,
            value: 1,
            type: 'ownership'
          });
        }
        break;
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
