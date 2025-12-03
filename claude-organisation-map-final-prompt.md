# 🚀 Organisation Map Implementation - Complete Claude Code Prompt

## MISSION BRIEF
Implement a comprehensive Organisation Map feature for the M&A Discovery Suite with interactive Sankey diagram matching LeanIX Enterprise Architecture functionality. This will be an "awesome" implementation with full LeanIX-style capabilities.

## 📋 REFERENCE MATERIALS
Read and understand these specification files before starting implementation:
- `organisation-map-spec.md` - Complete technical specification and requirements
- `claude-code-organisation-map-step-by-step.md` - Detailed step-by-step implementation guide with all code

## 🎯 IMPLEMENTATION REQUIREMENTS

### Data Sources
Pull data from ALL CSV discovery files in the `Modules/Discovery/` directory including:
- `ActiveDirectoryUsers.csv` - Users, departments, managers, locations
- `Infrastructure` discovery files - Servers, data centers, locations
- `Application` discovery files - Applications, platforms, dependencies
- `Exchange/SharePoint` files - Interfaces, connections, relationships

### Entity Types (LeanIX-compliant)
```
Company → L3 Platforms → Applications → Data Centers
Company → L3 Platforms → Applications → Locations
Company → L3 Platforms → Applications → L3 Organisations
Company → Business Unit Locations
Company → Line of Business → Divisions
Applications → Provider Interfaces (incoming)
Applications → Consumer Interfaces (outgoing)
```

### Fact Sheet Requirements
Each entity must have comprehensive LeanIX-style fact sheets with:
- **Base Info**: Name, type, description, owner, status
- **Relations Explorer**: Interactive relationship graph
- **IT Components**: Technical details, dependencies, versions
- **Subscriptions**: Who subscribes to this entity
- **Comments**: User comments and notes
- **To-dos**: Action items and tasks
- **Resources**: Related documents, links, contacts
- **Metrics**: Usage statistics, performance data, KPIs
- **Surveys**: User feedback, satisfaction scores

## 🔧 STEP-BY-STEP IMPLEMENTATION PLAN

### Phase 1: Navigation & Infrastructure ✅ (Already Started)
1. ✅ Update `guiv2/src/renderer/components/organisms/Sidebar.tsx` - Add "Organisation Map" menu with Network icon
2. ✅ Update `guiv2/src/renderer/routes.tsx` - Add lazy-loaded route for `/organisation-map`
3. ✅ Install dependencies: `d3@^7.8.5 d3-sankey@^0.12.3 @types/d3@^7.4.0 html2canvas@^1.4.1 jspdf@^2.5.1`
4. ✅ Create directories: `guiv2/src/renderer/views/organisation/`, `guiv2/src/renderer/types/models/`

### Phase 2: TypeScript Types & Data Models
**Create:** `guiv2/src/renderer/types/models/organisation.ts`

Implement ALL interfaces from the step-by-step guide:
- `EntityType` enum (10+ types)
- `SankeyNode` interface
- `SankeyLink` interface
- `FactSheetData` interface
- All supporting interfaces: `Relation`, `ITComponent`, `Subscription`, `Comment`, `Todo`, `Resource`, `Metric`, `Survey`

### Phase 3: Data Aggregation Logic
**Create:** `guiv2/src/renderer/hooks/useOrganisationMapLogic.ts`

Implement the complete data aggregation hook that:
- Scans all CSV discovery files
- Parses CSV data with PascalCase property mapping
- Creates Sankey nodes for each entity type
- Generates hierarchical links (Company → Platforms → Applications → Infrastructure)
- Merges duplicate entities
- Handles all 10+ entity types from LeanIX specification

**Update:** `guiv2/src/main/ipcHandlers.ts`
Add IPC handlers for file discovery and reading.

### Phase 4: Sankey Diagram Component
**Create:** `guiv2/src/renderer/components/organisms/SankeyDiagram.tsx`

Implement D3.js-powered Sankey diagram with:
- Proper D3 Sankey layout calculations
- Color-coded nodes by entity type
- Interactive hover tooltips
- Click-to-drill-down functionality
- Zoom and pan controls
- Performance optimizations for 1000+ nodes
- Responsive design

### Phase 5: Control Panel Components
**Create:** `guiv2/src/renderer/components/organisms/EntityTypeFilter.tsx`
- Checkboxes for all entity types
- Select All/None functionality
- Real-time diagram filtering

**Create:** `guiv2/src/renderer/components/organisms/ZoomControls.tsx`
- Zoom in/out buttons
- Fit to screen
- Center on selection
- Reset view

**Create:** `guiv2/src/renderer/components/organisms/SearchBar.tsx`
- Real-time search across entities
- Debounced input for performance

**Create:** `guiv2/src/renderer/components/organisms/ExportControls.tsx`
- PNG export (high-res with html2canvas)
- SVG export (vector format)
- PDF export (with jsPDF)

### Phase 6: Fact Sheet Modal
**Create:** `guiv2/src/renderer/components/organisms/FactSheetModal.tsx`

Implement comprehensive modal with 9 tabs:
1. **Overview** - Base info, status, description
2. **Relations Explorer** - Interactive relationship visualization
3. **IT Components** - Technical details and dependencies
4. **Subscriptions** - Subscriber management
5. **Comments** - User comments and collaboration
6. **To-dos** - Action items and task management
7. **Resources** - Documents, links, and references
8. **Metrics** - Performance data and KPIs
9. **Surveys** - User feedback and satisfaction scores

### Phase 7: Main View Component
**Create:** `guiv2/src/renderer/views/organisation/OrganisationMapView.tsx`

Implement main view layout with:
- Control panel at top (filters, search, zoom, export)
- Sankey diagram in main area
- Fact sheet modal integration
- Loading states and error handling
- Responsive design for different screen sizes

## 🔗 INTEGRATION REQUIREMENTS

### Navigation Integration
- Menu appears after Discovery section
- Uses Network icon from Lucide React
- Route: `/organisation-map`
- Follows existing navigation patterns

### Data Integration
- Reads from ALL CSV files in `Modules/Discovery/`
- Uses PascalCase property mapping (critical!)
- Aggregates relationships across all discovery modules
- Handles missing data gracefully

### Performance Requirements
- Handles 1000+ nodes smoothly
- Debounced search/filter operations
- Lazy loading for fact sheet details
- Virtualized rendering for large datasets

## 🎨 UI/UX REQUIREMENTS

### Visual Design
- Professional LeanIX-style appearance
- Color-coded entity types
- Smooth animations and transitions
- Consistent with existing application design
- Responsive layout for all screen sizes

### Interactivity
- Hover shows basic fact sheet info
- Click opens comprehensive fact sheet modal
- Zoom/pan with mouse and controls
- Search highlights matching entities
- Filter updates diagram in real-time

### Export Quality
- PNG: High-resolution (2x) screenshots
- SVG: Vector format for documents
- PDF: Professional reports with metadata

## ✅ SUCCESS CRITERIA

### Functional Requirements
- [ ] Sankey diagram renders organisational hierarchy correctly
- [ ] All 10+ entity types represented with proper relationships
- [ ] Hover shows comprehensive fact sheet information
- [ ] Click provides drill-down to detailed views
- [ ] Filtering and search work smoothly
- [ ] Export functionality produces high-quality outputs
- [ ] Performance acceptable with large datasets (1000+ nodes)

### Quality Assurance
- [ ] TypeScript compilation without errors
- [ ] All components render without console errors
- [ ] Fact sheet modal displays all 9 tabs correctly
- [ ] Data aggregation works with sample CSV files
- [ ] Export functions work correctly
- [ ] Responsive design verified on different screen sizes

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All components created and functional
- [ ] Navigation and routing working
- [ ] Data aggregation from CSV files working
- [ ] Sankey diagram rendering correctly
- [ ] Fact sheet modal with all tabs
- [ ] Filtering and search implemented
- [ ] Export functionality working
- [ ] Performance tested with large datasets
- [ ] Responsive design verified

### Build Commands
```bash
cd guiv2
npm install  # Install new dependencies
npm run build  # Build main process
npx webpack --config webpack.renderer.config.js --mode=production  # Build renderer
npx webpack --config webpack.preload.config.js --mode=production  # Build preload
npm start  # Test the application
```

## 🆘 TROUBLESHOOTING

### Common Issues
- **PascalCase Properties**: Ensure PowerShell CSV output uses PascalCase (Name, not name)
- **D3.js Errors**: Check dependency versions and imports
- **Data Loading**: Verify IPC handlers are registered correctly
- **Performance**: Use useMemo for expensive calculations

### Debug Tips
- Add console.log statements in data aggregation
- Check browser developer tools for D3.js errors
- Verify CSV file parsing with sample data
- Test with small datasets first, then scale up

## 📚 REFERENCE IMPLEMENTATION

Follow the patterns established in existing discovery views:
- `useFileSystemDiscoveryLogic.ts` - Data aggregation pattern
- `VirtualizedDataGrid.tsx` - Component structure
- `guiv2/src/renderer/types/models/` - Type definition patterns

## 🎯 FINAL DELIVERABLE

A fully functional Organisation Map feature that provides LeanIX Enterprise Architecture-level functionality within the M&A Discovery Suite, with professional UI/UX and comprehensive data visualization capabilities.

**Ready to implement! Follow the step-by-step guide in `claude-code-organisation-map-step-by-step.md` for complete code implementations.**