# Organisation Map Enhancement Plan - To Be Continued

**Status:** NOT STARTED - Plan documented, implementation pending
**Last Updated:** 2025-12-22
**Priority:** High - Core feature enhancement

## Mission Overview
Transform the existing organisation map into a comprehensive LeanIX-style Enterprise Architecture visualization that dynamically displays the organisation structure based on all discovered data in the ljpops raw folder.

## Current State Analysis

### Implemented (Basic Foundation)
- CSV Processing: useOrganisationMapLogic processes CSV files from ljpops raw folder
- Entity Mapping: 116+ CSV file types mapped to EntityTypes with proper naming extraction
- Cross-file Linking: Basic relationship generation between files
- Business Capability Inference: Automatic inference from departments/groups
- Performance Optimizations: Batching, caching, deduplication algorithms
- SankeyDiagram Component: D3-based visualization with layer positioning
- FactSheetModal Component: 9-tab modal structure (mostly empty shells)
- OrganisationMapFilters Component: Entity type, status, and search filtering
- OrganisationMapView: Main view with modal integration
- Complete Type Definitions: All LeanIX-style types defined in organisation.ts

### Not Implemented (Super Prompt Requirements)
- Advanced Entity Resolution: Fuzzy matching, confidence scoring
- Machine Learning Relationship Detection: Pattern-based inference
- IT Components Tab: No linkage to underlying infrastructure
- Subscriptions & Licensing: No Azure subscription integration
- Comments, Todos & Surveys: No collaborative features
- Export Capabilities: No PNG/PDF/SVG/JSON export
- Real-time Data Refresh: No live discovery module integration
- Analytics Dashboard: No usage metrics or reporting

## 5-Phase Implementation Plan

### Phase 1: Enhanced Data Ingestion & Entity Linking
**Goal:** Ensure all discovered data from C:\discoverydata\ljpops\Raw is properly ingested and linked

**Tasks:**
1. Audit Current CSV Processing
   - Verify all 70+ discovery modules produce correctly formatted CSV files
   - Check for missing or malformed data in ljpops raw folder
   - Validate type mapping coverage for all CSV types

2. Enhance Entity Resolution
   - Implement fuzzy matching for entity deduplication
   - Add confidence scoring for relationship inference
   - Create entity normalization rules for consistent naming

3. Advanced Relationship Inference
   - Implement machine learning-based relationship detection
   - Add temporal relationship analysis (creation dates, modification dates)
   - Create relationship strength scoring and validation

### Phase 2: Complete LeanIX Fact Sheet Implementation
**Goal:** Populate all 9 LeanIX fact sheet tabs with rich data

**Tasks:**
1. IT Components Tab Enhancement
   - Link applications to their underlying infrastructure
   - Add software inventory data from discovery modules
   - Implement version tracking and dependency mapping

2. Subscriptions & Licensing Integration
   - Connect Azure subscriptions to resources
   - Add licensing information from discovery data
   - Implement cost analysis and renewal tracking

3. Comments, Todos & Surveys System
   - Create collaborative annotation system
   - Add survey integration for user feedback
   - Implement todo tracking for migration projects

### Phase 3: Advanced Visualization & Analytics
**Goal:** Create LeanIX-grade visualization capabilities

**Tasks:**
1. Enhanced Sankey Diagram Features
   - Add heatmaps for usage intensity
   - Implement timeline views for change tracking
   - Create impact analysis visualizations

2. Export & Reporting Capabilities
   - PNG/PDF/SVG diagram exports
   - JSON data exports for external tools
   - Automated report generation

3. Advanced Filtering & Search
   - Fuzzy search with autocomplete
   - Multi-dimensional filtering
   - Saved filter sets and bookmarks

### Phase 4: Performance & Scalability
**Goal:** Handle enterprise-scale data (1000+ nodes, 10000+ links)

**Tasks:**
1. Performance Optimizations
   - Implement virtualized rendering for large diagrams
   - Add progressive loading and pagination
   - Optimize relationship calculation algorithms

2. Real-time Data Integration
   - Connect to live discovery module updates
   - Implement incremental data refresh
   - Add data quality monitoring and alerts

### Phase 5: Enterprise Features & Integration
**Goal:** Complete LeanIX feature parity

**Tasks:**
1. Advanced Analytics Dashboard
   - Usage metrics and trends
   - Dependency impact analysis
   - Risk assessment and compliance reporting

2. Collaborative Features
   - Multi-user editing capabilities
   - Change tracking and audit logs
   - Integration with project management tools

3. API & Integration Layer
   - REST API for external integrations
   - Webhook support for real-time updates
   - Integration with existing enterprise systems

## Technical Architecture Enhancements

### Data Processing Pipeline
```
Raw CSV Files → Enhanced Parser → Entity Resolution → Relationship Inference → Fact Sheet Enrichment → Visualization Layer
```

### Key Components to Enhance/Implement

1. **Enhanced useOrganisationMapLogic Hook**
   - Add incremental update capabilities
   - Implement advanced caching strategies
   - Add data validation and quality checks

2. **New FactSheetService**
   - Populate all 9 LeanIX tabs
   - Implement data enrichment from multiple sources
   - Add collaborative features (comments, todos)

3. **Advanced SankeyDiagram Component**
   - Add zoom, pan, and navigation controls
   - Implement node grouping and clustering
   - Add interactive relationship highlighting

4. **ExportService**
   - Multiple format support (PNG, PDF, SVG, JSON)
   - Customizable templates and layouts
   - Batch export capabilities

5. **AnalyticsEngine**
   - Real-time metrics calculation
   - Trend analysis and forecasting
   - Impact assessment algorithms

## Success Criteria
- Data Coverage: All CSV files in ljpops raw folder properly ingested
- Entity Linking: 95%+ accurate relationship inference
- LeanIX Parity: All 9 fact sheet tabs fully populated
- Performance: Handle 2000+ nodes with <2s load time
- User Experience: Intuitive navigation and rich interactions
- Export Capabilities: Professional-quality diagram exports
- Real-time Updates: Live data refresh from discoveries

## Implementation Status Matrix

| Component | Planned | Implemented | Status |
|-----------|---------|-------------|--------|
| CSV Processing | Yes | Yes | Complete |
| Entity Mapping | Yes | Yes | Complete |
| Basic Relationships | Yes | Yes | Complete |
| Sankey Visualization | Yes | Yes | Complete |
| Fact Sheet Modal | Yes | Partial | Skeleton Only |
| Advanced Relationships | Yes | No | Not Started |
| Export Features | Yes | No | Not Started |
| Real-time Updates | Yes | No | Not Started |
| Analytics | Yes | No | Not Started |
| Collaboration | Yes | No | Not Started |

## Files Modified/Created This Session

### TypeScript Fixes Applied:
1. `forge.config.js` - Commented out unused FusesPlugin imports
2. `organisation.ts` - Added `sourceFile` to SankeyNode metadata
3. `SankeyDiagram.tsx` - Fixed D3 event handler type issues
4. `FactSheetModal.tsx` - Uses sourceFile from metadata
5. `MigrationDashboardView.tsx` - Fixed startWave reference
6. `useApplicationDependencyMappingDiscoveryLogic.ts` - Fixed interface inheritance

## Next Steps (When Resuming)
1. Start with Phase 1: Enhanced Data Ingestion
2. Implement fuzzy matching for entity deduplication
3. Add confidence scoring system
4. Create FactSheetService for data enrichment
5. Implement export capabilities

## Related Files
- `D:\Scripts\UserMandA\guiv2\src\renderer\hooks\useOrganisationMapLogic.ts`
- `D:\Scripts\UserMandA\guiv2\src\renderer\components\organisms\SankeyDiagram.tsx`
- `D:\Scripts\UserMandA\guiv2\src\renderer\components\organisms\FactSheetModal.tsx`
- `D:\Scripts\UserMandA\guiv2\src\renderer\views\organisation\OrganisationMapView.tsx`
- `D:\Scripts\UserMandA\guiv2\src\renderer\types\models\organisation.ts`
