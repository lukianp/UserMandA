# Organisation Map Feature - Technical Specification

## Overview
Create an interactive Organisation Map view similar to LeanIX Enterprise Architecture, displayed as a Sankey diagram. This feature will visualize organisational structure and relationships across all discovery data.

## Requirements

### Navigation
- Add "Organisation Map" menu item to the left sidebar navigation
- Position it logically within the existing menu structure (after Discovery, before Users)

### Data Sources
- **All CSV discovery files** from the discovery modules
- **Primary data relationships:**
  - ActiveDirectoryUsers.csv (users, departments, managers, locations)
  - Infrastructure discovery files (servers, data centers, locations)
  - Application discovery files (applications, platforms, dependencies)
  - Exchange/SharePoint files (interfaces, connections)
  - Network infrastructure files (connections, interfaces)

### Visual Design - Sankey Diagram
- **Library**: Use D3.js Sankey diagram or similar (react-sankey-chart, @ant-design/charts, or recharts)
- **Layout**: Horizontal flow from left to right
- **Node Types**: Color-coded by entity type
- **Flows**: Thickness represents relationship strength/volume

### Entity Types (Nodes)
Based on LeanIX organisational mapping:
1. **Company** (root node)
2. **L3 Platforms** (platform technologies)
3. **Applications** (each platform becomes applications)
4. **Data Centers** (infrastructure locations)
5. **Business Unit Locations** (organisational locations)
6. **L3 Organisations** (organisational units)
7. **Line of Business** (business domains)
8. **Divisions** (AD divisions)
9. **Provider Interfaces** (incoming connections)
10. **Consumer Interfaces** (outgoing connections)

### Flow Relationships
**Primary Hierarchy:**
```
Company → L3 Platforms → Applications → Data Centers
Company → L3 Platforms → Applications → Locations
Company → L3 Platforms → Applications → L3 Organisations
Company → Business Unit Locations
Company → Line of Business → Divisions
```

**Interface Connections:**
```
Applications → Provider Interfaces (incoming)
Applications → Consumer Interfaces (outgoing)
```

### Interactivity Features

#### Hover Details (Full Fact Sheet)
Display comprehensive LeanIX-style fact sheet on hover:
- **Base Info**: Name, type, description, owner, status
- **Relations Explorer**: Connected entities, relationship types, flow volumes
- **IT Components**: Technical details, dependencies, versions
- **Subscriptions**: Who subscribes to this entity
- **Comments**: User comments and notes
- **To-dos**: Action items and tasks
- **Resources**: Related documents, links, contacts
- **Metrics**: Usage statistics, performance data, KPIs
- **Surveys**: User feedback, satisfaction scores
- **Last Update**: Modification timestamp and user

#### Click-to-Drill-Down
- Click nodes to open detailed modal/drawer
- Show full entity details with relationships
- Allow navigation to related views (e.g., click server → infrastructure view)

#### Filtering & Search
- **Entity Type Filter**: Show/hide specific node types
- **Search**: Find entities by name, type, or properties
- **Relationship Filter**: Focus on specific relationship types
- **Depth Filter**: Limit diagram depth for performance

#### Navigation Controls
- **Zoom**: Mouse wheel or buttons (+/-)
- **Pan**: Drag to move diagram
- **Fit to Screen**: Auto-adjust zoom to show all
- **Center on Selection**: Focus on selected entity

#### Export Options
- **PNG**: High-resolution image export
- **SVG**: Vector format for documents
- **PDF**: Full report with diagram and legend

### Data Processing

#### Data Aggregation Hook (`useOrganisationMapLogic.ts`)
```typescript
// Aggregate data from multiple CSV sources
const aggregatedData = useMemo(() => {
  const companies = extractCompanies(adUsers, infrastructure, ...);
  const platforms = extractPlatforms(applications, infrastructure, ...);
  const applications = extractApplications(appDiscovery, ...);
  const interfaces = extractInterfaces(exchange, sharepoint, ...);

  return {
    nodes: [...companies, ...platforms, ...applications, ...interfaces],
    links: generateSankeyLinks(companies, platforms, applications, interfaces)
  };
}, [allDiscoveryData]);
```

#### Sankey Data Structure
```typescript
interface SankeyNode {
  id: string;
  name: string;
  type: 'company' | 'platform' | 'application' | 'datacenter' | 'location' | 'interface';
  factSheet: FactSheetData;
  metadata: Record<string, any>;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number; // Flow strength
  type: 'ownership' | 'deployment' | 'interface' | 'organisational';
}

interface FactSheetData {
  baseInfo: {
    name: string;
    type: string;
    description?: string;
    owner?: string;
    status: string;
  };
  relations: {
    incoming: Relation[];
    outgoing: Relation[];
  };
  itComponents: ITComponent[];
  subscriptions: Subscription[];
  comments: Comment[];
  todos: Todo[];
  resources: Resource[];
  metrics: Metric[];
  surveys: Survey[];
  lastUpdate: Date;
}
```

### Component Architecture

#### OrganisationMapView (`OrganisationMapView.tsx`)
```typescript
export const OrganisationMapView: React.FC = () => {
  const { data, loading, error } = useOrganisationMapLogic();
  const { selectedNode, setSelectedNode } = useState<SankeyNode | null>(null);

  return (
    <div className="organisation-map-container">
      <div className="controls-panel">
        <EntityTypeFilter />
        <SearchBar />
        <ZoomControls />
        <ExportControls />
      </div>

      <SankeyDiagram
        data={data}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        selectedNode={selectedNode}
      />

      {selectedNode && (
        <FactSheetModal
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
};
```

#### SankeyDiagram Component
- Implement using D3.js or React Sankey library
- Handle large datasets with virtualization
- Smooth animations for updates
- Responsive design

### Implementation Steps

1. **Add Navigation Menu Item**
   - Update `Sidebar.tsx` to include Organisation Map
   - Add route in `routes.tsx`

2. **Create View Component**
   - `OrganisationMapView.tsx` with layout and controls
   - Integrate with existing design system

3. **Implement Data Logic Hook**
   - `useOrganisationMapLogic.ts` for data aggregation
   - Parse all CSV files and build relationships
   - Handle loading and error states

4. **Build Sankey Diagram Component**
   - Choose appropriate library (D3.js recommended)
   - Implement node rendering and styling
   - Add interactivity (hover, click, zoom, pan)

5. **Create Fact Sheet Components**
   - Modal/drawer for detailed entity information
   - Tabbed interface for different fact sheet sections
   - Rich content display (metrics, surveys, etc.)

6. **Add Filtering and Search**
   - Real-time filtering of diagram
   - Search with highlighting
   - State management for filter persistence

7. **Implement Export Functionality**
   - PNG/SVG export using canvas/SVG APIs
   - PDF generation with diagram and metadata

8. **Performance Optimization**
   - Virtualize large diagrams
   - Lazy load fact sheet details
   - Debounce search/filter operations

9. **Testing and Polish**
   - Test with various data sizes
   - Ensure responsive design
   - Add loading states and error boundaries

### Success Criteria
- ✅ Sankey diagram renders organisational hierarchy correctly
- ✅ All entity types from LeanIX specification represented
- ✅ Hover shows comprehensive fact sheet information
- ✅ Click provides drill-down to detailed views
- ✅ Filtering and search work smoothly
- ✅ Export functionality produces high-quality outputs
- ✅ Performance acceptable with large datasets (1000+ nodes)
- ✅ Responsive design works on different screen sizes
- ✅ Integrates seamlessly with existing application design

### Dependencies
- D3.js (for Sankey diagram)
- React components from existing design system
- CSV parsing utilities (existing)
- Export libraries (for PNG/SVG/PDF generation)

This specification provides the complete technical requirements for implementing the Organisation Map feature with full LeanIX-style functionality.