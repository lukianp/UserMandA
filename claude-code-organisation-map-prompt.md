# Claude Code: Organisation Map Implementation

## MISSION BRIEF
Implement a comprehensive Organisation Map feature for the M&A Discovery Suite, featuring an interactive Sankey diagram similar to LeanIX Enterprise Architecture. This will be an "awesome" implementation with full LeanIX-style functionality.

## ARCHITECTURAL OVERVIEW

### Navigation Integration
- Add "Organisation Map" to sidebar navigation after Discovery section
- Use Network icon from Lucide React
- Route: `/organisation-map`
- Position between Discovery and Users sections

### Core Components to Create
1. **OrganisationMapView.tsx** - Main view component with controls and diagram
2. **SankeyDiagram.tsx** - D3.js-powered interactive Sankey diagram
3. **useOrganisationMapLogic.ts** - Data aggregation hook
4. **FactSheetModal.tsx** - LeanIX-style detailed entity information
5. **EntityTypeFilter.tsx** - Filter controls for diagram
6. **ZoomControls.tsx** - Navigation controls
7. **ExportControls.tsx** - PNG/SVG/PDF export functionality

### Data Architecture

#### Entity Types (LeanIX-compliant)
```typescript
type EntityType =
  | 'company'
  | 'platform'      // L3 Platforms
  | 'application'
  | 'datacenter'
  | 'location'
  | 'organisation'  // L3 Organisations
  | 'business-unit'
  | 'line-of-business'
  | 'division'
  | 'provider-interface'
  | 'consumer-interface';
```

#### Sankey Data Structures
```typescript
interface SankeyNode {
  id: string;
  name: string;
  type: EntityType;
  factSheet: FactSheetData;
  metadata: Record<string, any>;
  x?: number; // Calculated by D3
  y?: number; // Calculated by D3
}

interface SankeyLink {
  source: string | SankeyNode;
  target: string | SankeyNode;
  value: number;
  type: 'ownership' | 'deployment' | 'interface' | 'organisational';
}

interface FactSheetData {
  baseInfo: {
    name: string;
    type: EntityType;
    description?: string;
    owner?: string;
    status: 'active' | 'inactive' | 'planned' | 'deprecated';
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

## IMPLEMENTATION REQUIREMENTS

### Phase 1: Navigation & Routing
1. Update `Sidebar.tsx` - Add Organisation Map menu item
2. Update `routes.tsx` - Add lazy-loaded route for `/organisation-map`
3. Create directory `guiv2/src/renderer/views/organisation/`

### Phase 2: Data Aggregation Logic
Create `useOrganisationMapLogic.ts`:

#### CSV Data Sources to Process:
- **ActiveDirectoryUsers.csv** - Users, departments, managers, locations
- **Infrastructure discovery files** - Servers, data centers, network devices
- **Application discovery files** - Applications, platforms, dependencies
- **Exchange/SharePoint files** - Mailboxes, interfaces, connections
- **Azure/Intune files** - Cloud resources, devices, configurations

#### Data Extraction Functions:
```typescript
const extractCompanies = (csvData: any[]): SankeyNode[] => {
  // Extract unique companies from CompanyName fields
};

const extractPlatforms = (csvData: any[]): SankeyNode[] => {
  // Extract L3 platforms from application data
};

const extractApplications = (csvData: any[]): SankeyNode[] => {
  // Extract applications and their relationships
};

const extractInterfaces = (csvData: any[]): SankeyNode[] => {
  // Extract provider/consumer interfaces from Exchange/SharePoint
};
```

#### Relationship Generation:
```typescript
const generateSankeyLinks = (
  companies: SankeyNode[],
  platforms: SankeyNode[],
  applications: SankeyNode[],
  interfaces: SankeyNode[]
): SankeyLink[] => {
  // Create links based on LeanIX hierarchy:
  // Company → Platforms → Applications → Data Centers
  // Applications → Interfaces
};
```

### Phase 3: Sankey Diagram Component
Create `SankeyDiagram.tsx` using D3.js:

#### Features Required:
- **D3.js Sankey Layout**: `d3-sankey` for proper diagram generation
- **Color Coding**: Different colors for each entity type
- **Interactive Hover**: Show tooltip with basic info
- **Click Handling**: Emit events for detailed views
- **Responsive**: Handle different container sizes
- **Performance**: Virtualize for large datasets (1000+ nodes)

#### Node Styling:
```typescript
const getNodeColor = (type: EntityType): string => {
  const colors = {
    company: '#1f77b4',
    platform: '#ff7f0e',
    application: '#2ca02c',
    datacenter: '#d62728',
    location: '#9467bd',
    // ... more colors
  };
  return colors[type] || '#7f7f7f';
};
```

#### Link Styling:
- Thickness based on flow value
- Color based on relationship type
- Gradient effects for visual appeal

### Phase 4: Fact Sheet Modal
Create `FactSheetModal.tsx` with full LeanIX-style information:

#### Tab Structure:
1. **Overview** - Base info, status, description
2. **Relations Explorer** - Interactive relationship graph
3. **IT Components** - Technical details, dependencies
4. **Subscriptions** - Who subscribes to this entity
5. **Comments** - User comments and notes
6. **To-dos** - Action items and tasks
7. **Resources** - Related documents, links
8. **Metrics** - Usage statistics, KPIs
9. **Surveys** - User feedback, satisfaction scores

#### Relations Explorer:
- Mini Sankey showing connected entities
- Click to navigate to related entities
- Filter by relationship type

### Phase 5: Control Panel Components

#### EntityTypeFilter.tsx:
- Checkboxes for each entity type
- Real-time diagram updates
- "Select All/None" options

#### ZoomControls.tsx:
- Zoom in/out buttons
- Fit to screen
- Center on selection
- Reset view

#### ExportControls.tsx:
- Export to PNG (high-res)
- Export to SVG (vector)
- Export to PDF (with metadata)

### Phase 6: Main View Layout
Create `OrganisationMapView.tsx`:

```typescript
export const OrganisationMapView: React.FC = () => {
  const { data, loading, error } = useOrganisationMapLogic();
  const [selectedNode, setSelectedNode] = useState<SankeyNode | null>(null);
  const [filteredTypes, setFilteredTypes] = useState<EntityType[]>(allTypes);

  return (
    <div className="organisation-map-container h-full flex flex-col">
      {/* Control Panel */}
      <div className="controls-panel p-4 border-b bg-white shadow-sm">
        <div className="flex gap-4 items-center">
          <EntityTypeFilter
            selectedTypes={filteredTypes}
            onChange={setFilteredTypes}
          />
          <SearchBar onSearch={handleSearch} />
          <ZoomControls onZoom={handleZoom} />
          <ExportControls onExport={handleExport} />
        </div>
      </div>

      {/* Diagram Area */}
      <div className="diagram-container flex-1 relative">
        {loading && <LoadingSpinner />}
        {error && <ErrorDisplay error={error} />}
        {data && (
          <SankeyDiagram
            data={data}
            filteredTypes={filteredTypes}
            onNodeHover={handleNodeHover}
            onNodeClick={setSelectedNode}
            className="w-full h-full"
          />
        )}
      </div>

      {/* Fact Sheet Modal */}
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

## TECHNICAL DEPENDENCIES

### Add to package.json:
```json
{
  "dependencies": {
    "d3": "^7.8.5",
    "d3-sankey": "^0.12.3",
    "@types/d3": "^7.4.0",
    "react-pdf": "^7.7.1",
    "html2canvas": "^1.4.1"
  }
}
```

### D3.js Integration:
- Use `d3-sankey` for proper Sankey layout calculations
- `d3-zoom` for pan/zoom functionality
- `d3-selection` for interactions

## PERFORMANCE CONSIDERATIONS

### Large Dataset Handling:
- Virtualize nodes for >500 entities
- Debounce filter/search operations
- Lazy load fact sheet details
- Use React.memo for expensive components

### Memory Management:
- Clean up D3 selections on unmount
- Use useMemo for expensive calculations
- Implement proper cleanup in useEffect

## QUALITY ASSURANCE

### Testing Requirements:
- Unit tests for data aggregation logic
- Integration tests for D3.js interactions
- Performance tests with large datasets (1000+ nodes)
- Responsive design testing

### Error Handling:
- Graceful degradation when data is missing
- Clear error messages for failed CSV parsing
- Loading states for long operations
- Retry mechanisms for failed operations

## SUCCESS CRITERIA

### ✅ Functional Requirements:
- Sankey diagram renders organisational hierarchy correctly
- All 10+ entity types from LeanIX spec represented
- Hover shows comprehensive fact sheet information
- Click provides drill-down to detailed views
- Filtering and search work smoothly
- Export functionality produces high-quality outputs
- Performance acceptable with large datasets

### ✅ User Experience:
- Intuitive navigation and controls
- Smooth interactions and animations
- Responsive design for different screen sizes
- Professional LeanIX-style appearance
- Comprehensive fact sheet information

### ✅ Technical Excellence:
- Clean, maintainable TypeScript code
- Proper separation of concerns
- Comprehensive error handling
- Performance optimized
- Well-documented components

## DEPLOYMENT CHECKLIST

- [ ] All components created and functional
- [ ] Navigation and routing working
- [ ] Data aggregation from CSV files working
- [ ] Sankey diagram rendering correctly
- [ ] Fact sheet modal with all tabs
- [ ] Filtering and search implemented
- [ ] Export functionality working
- [ ] Performance tested with large datasets
- [ ] Responsive design verified
- [ ] Error handling comprehensive
- [ ] Code reviewed and documented

## IMPLEMENTATION NOTES

### Code Style:
- Follow existing project patterns (PascalCase for PowerShell data)
- Use TypeScript interfaces extensively
- Implement proper error boundaries
- Add comprehensive JSDoc comments

### Integration Points:
- Use existing CSV parsing utilities
- Follow established component patterns
- Integrate with profile management system
- Maintain consistency with other views

### Future Extensibility:
- Design for easy addition of new entity types
- Make relationship logic configurable
- Prepare for real-time data updates
- Consider WebGL acceleration for very large diagrams

---

**This implementation will create a world-class Organisation Map feature that rivals LeanIX in functionality and user experience.**