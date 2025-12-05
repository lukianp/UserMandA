# Claude Code: Organisation Map Implementation - Step-by-Step Technical Guide

## MISSION OVERVIEW
Implement a comprehensive Organisation Map feature with interactive Sankey diagram, matching LeanIX Enterprise Architecture functionality. Follow this step-by-step guide precisely.

## PHASE 1: NAVIGATION & INFRASTRUCTURE SETUP

### Step 1.1: Update Sidebar Navigation
**File:** `guiv2/src/renderer/components/organisms/Sidebar.tsx`

**Add Network icon import:**
```typescript
import { Network } from 'lucide-react';
```

**Add Organisation Map menu item after Discovery section:**
```typescript
const navItems: NavItem[] = [
  // ... existing items ...
  {
    path: '/discovery',
    label: 'Discovery',
    icon: <Search size={20} />,
    children: [
      { path: '/discovery/domain', label: 'Domain', icon: <ChevronRight size={16} /> },
      { path: '/discovery/azure', label: 'Azure AD', icon: <ChevronRight size={16} /> },
    ],
  },
  {
    path: '/organisation-map',
    label: 'Organisation Map',
    icon: <Network size={20} />,
  },
  {
    path: '/users',
    label: 'Users',
    icon: <Users size={20} />,
  },
  // ... rest of items ...
];
```

### Step 1.2: Add Routing
**File:** `guiv2/src/renderer/routes.tsx`

**Add lazy import:**
```typescript
const OrganisationMapView = lazy(() => import('./views/organisation/OrganisationMapView'));
```

**Add route after Discovery routes:**
```typescript
{/* Discovery Routes */}
<Route path="/discovery" element={<DiscoveryView />} />
<Route path="/discovery/domain" element={<DomainDiscoveryView />} />
<Route path="/discovery/azure" element={<AzureDiscoveryView />} />

{/* Organisation Map */}
<Route path="/organisation-map" element={<OrganisationMapView />} />

{/* Users and Groups */}
<Route path="/users" element={<UsersView />} />
```

### Step 1.3: Install Dependencies
**Run in terminal:**
```bash
cd guiv2
npm install d3@^7.8.5 d3-sankey@^0.12.3 @types/d3@^7.4.0 html2canvas@^1.4.1 jspdf@^2.5.1
```

### Step 1.4: Create Directory Structure
**Create directories:**
```bash
mkdir -p guiv2/src/renderer/views/organisation
mkdir -p guiv2/src/renderer/hooks
mkdir -p guiv2/src/renderer/types/models
## PHASE 3: DATA AGGREGATION LOGIC

### Step 3.1: Create Data Aggregation Hook
**File:** `guiv2/src/renderer/hooks/useOrganisationMapLogic.ts`

```typescript
import { useState, useEffect, useMemo } from 'react';
import { SankeyNode, SankeyLink, EntityType } from '../types/models/organisation';

interface OrganisationMapData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

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

      // Get all CSV files from discovery data
      const csvFiles = await window.electronAPI.invoke('get-discovery-files');

      // Process each CSV file
      const allNodes: SankeyNode[] = [];
      const allLinks: SankeyLink[] = [];

      for (const file of csvFiles) {
        const content = await window.electronAPI.invoke('read-discovery-file', file.path);
        const fileNodes = parseCSVToNodes(content, file.type);
        const fileLinks = generateLinksForFile(fileNodes, file.type);

        allNodes.push(...fileNodes);
        allLinks.push(...fileLinks);
      }

      // Merge duplicate nodes and links
      const mergedData = mergeDuplicateEntities(allNodes, allLinks);

      setData(mergedData);
    } catch (err) {
      console.error('Error fetching organisation map data:', err);
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

function parseCSVToNodes(csvContent: string, fileType: string): SankeyNode[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1);

  return rows.map((row, index) => {
    const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
    const record = headers.reduce((obj, header, i) => {
      obj[header] = values[i] || '';
      return obj;
    }, {} as any);

    return createNodeFromRecord(record, fileType, index);
  }).filter(Boolean) as SankeyNode[];
}

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
      factSheet: createFactSheet(record, interfaceType),
      metadata: { source: fileType, record }
    };
  }

  return null;
}

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
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;

    if (!acc.find(l => {
      const lSourceId = typeof l.source === 'string' ? l.source : l.source.id;
      const lTargetId = typeof l.target === 'string' ? l.target : l.target.id;
      return lSourceId === sourceId && lTargetId === targetId;
    })) {
      acc.push(link);
    }
    return acc;
  }, [] as SankeyLink[]);

  return { nodes: uniqueNodes, links: uniqueLinks };
}
```

### Step 3.2: Add IPC Handler Support
**File:** `guiv2/src/main/ipcHandlers.ts`

**Add new IPC handlers:**
```typescript
import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

// Add after existing handlers
ipcMain.handle('get-discovery-files', async () => {
  const discoveryPath = path.join(process.cwd(), 'Modules', 'Discovery');
  const csvFiles: Array<{path: string, type: string}> = [];

  // Scan for CSV files in discovery modules
  const scanDirectory = (dir: string) => {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (file.endsWith('.csv')) {
        // Determine file type based on filename patterns
        let type = 'generic';
        if (file.includes('Users')) type = 'users';
        else if (file.includes('Groups')) type = 'groups';
        else if (file.includes('Applications')) type = 'applications';
        else if (file.includes('Infrastructure')) type = 'infrastructure';
        else if (file.includes('Exchange')) type = 'exchange';

        csvFiles.push({ path: fullPath, type });
      }
    });
  };

  scanDirectory(discoveryPath);
  return csvFiles;
});

ipcMain.handle('read-discovery-file', async (_, filePath: string) => {
  return fs.readFileSync(filePath, 'utf8');
});
```