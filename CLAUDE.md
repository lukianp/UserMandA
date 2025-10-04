# M&A Discovery Suite: GUI v2 - Active Implementation Specification

**Project Mandate:** Full rewrite of `/GUI` (C#/WPF) to `/guiv2` (TypeScript/React/Electron) with 100% feature parity.

**COMPLETION STATUS:** ~43% Complete (See FINISHED.md for completed work)

---

## Target Architecture

- **Directory:** `/guiv2`
- **Framework:** Electron + React 18 + TypeScript
- **State:** Zustand (persist, devtools, immer, subscribeWithSelector)
- **Styling:** Tailwind CSS only (no traditional CSS)
- **Data Grid:** AG Grid Enterprise
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Testing:** Jest + Playwright + React Testing Library
- **Build:** Electron Forge + TypeScript + Webpack

## Global Performance Requirements (All Phases)

**Apply to ALL tasks:**
- Memory: 500MB baseline, 1GB under load max
- Rendering: 60 FPS, <100ms interaction, <16ms frame time
- Bundle: <5MB initial, <15MB total
- Data: Virtualize 100+ items, debounce 300ms, cache with TTL
- Loading: Code split by route, lazy load heavy deps (AG Grid, Recharts)

---

## ✅ Completed Phases (See FINISHED.md)

- ✅ **Phase 0:** Project Scaffolding & Build Setup (100%)
- ✅ **Phase 1:** Type Definitions & Backend Services (100%)
- ✅ **Phase 2:** UI Component Library (100%)
- ✅ **Phase 3:** Main Application Assembly (100%)
- ✅ **Phase 4:** Views Implementation Tier 1 (100%)
- ✅ **Phase 5:** Dialogs & UX Features (100%)
- ✅ **Phase 6:** Migration Module (100%)
- ✅ **Phase 9:** Critical Discovery Views (100% - All 26 views complete!)

---

## 🚧 ACTIVE WORK - Phase 7: Analytics & Reporting

**Goal:** Complete advanced analytics and custom reporting functionality

**Status:** 50% Complete (4/8 views done)

### Task 7.1: Report Views (IN PROGRESS)

**Completed:**
- ✅ ExecutiveDashboardView - KPIs, charts
- ✅ UserAnalyticsView - User analytics
- ✅ MigrationReportView - Migration stats
- ✅ CostAnalysisView - Cost analysis

**Remaining:**
- ⏳ **CustomReportBuilderView** - Drag-drop report builder
- ⏳ **ScheduledReportsView** - Report scheduling
- ⏳ **ReportTemplatesView** - Report templates
- ⏳ **DataVisualizationView** - Advanced charts

**Priority:** P1 HIGH

**Instructions for Remaining Views:**
1. Install Recharts for advanced charting (already installed)
2. Create drag-drop interface using react-beautiful-dnd or @dnd-kit
3. Implement report builder with field selection, filters, grouping
4. Add export to PDF, Excel, CSV
5. Implement report scheduling with cron expressions
6. Create template library for common reports

---

## 🚧 Phase 8: Performance & Polish

**Goal:** Optimize bundle size, performance, and user experience

**Status:** 25% Complete

### Task 8.1: Bundle Optimization (PENDING)

**Instructions:**
1. Verify code splitting by route works
2. Run `npm run analyze` to identify large dependencies
3. Lazy load AG Grid, Recharts using React.lazy()
4. Enable tree shaking in webpack config
5. Add gzip compression for production builds
6. Implement route-based code splitting
7. Analyze and optimize CSS bundle size

**Target Metrics:**
- <5MB initial bundle
- <15MB total bundle
- <3s initial load time

**Priority:** P1 HIGH

---

### Task 8.2: E2E Tests for Critical Paths (PENDING)

**Instructions:**
Write Playwright tests for:

1. **User Journey Test:**
   - Launch app
   - Select source profile
   - Run domain discovery
   - View discovered users
   - Export users to CSV
   - Verify export file

2. **Migration Journey Test:**
   - Create migration project
   - Create migration wave
   - Assign users to wave
   - Map resources (source → target)
   - Run validation
   - Execute migration (dry run)
   - Verify migration status

3. **Discovery Journey Test:**
   - Launch each discovery module
   - Verify data loads
   - Test filtering
   - Test search
   - Test export

**Priority:** P0 CRITICAL

---

## 🚧 Phase 10: Core Services Implementation (ACTIVE)

**Goal:** Implement remaining critical services

**Status:** 11/130+ services (8% complete)

### Task 10.1: Enhanced PowerShell Execution Service (IN PROGRESS)

**Current Gap:** Basic PowerShell service lacks advanced features (40% incomplete)

**Required Enhancements to** `guiv2/src/main/services/powerShellService.ts`:

**Missing Features:**
1. **Multiple Stream Handling:**
   ```typescript
   class EnhancedPowerShellService extends PowerShellExecutionService {
     // Stream handling
     onOutputStream(callback: (data: string) => void): void
     onErrorStream(callback: (data: string) => void): void
     onProgressStream(callback: (progress: Progress) => void): void
     onVerboseStream(callback: (data: string) => void): void
     onDebugStream(callback: (data: string) => void): void
     onWarningStream(callback: (data: string) => void): void
     onInformationStream(callback: (data: string) => void): void
   }
   ```

2. **Module Discovery:**
   ```typescript
   async discoverModules(): Promise<ModuleInfo[]>
   async getInstalledModules(): Promise<Module[]>
   async importModule(modulePath: string): Promise<void>
   async removeModule(moduleName: string): Promise<void>
   ```

3. **Script Library Management:**
   ```typescript
   async getScriptLibrary(): Promise<Script[]>
   async saveScript(script: Script): Promise<void>
   async deleteScript(scriptId: string): Promise<void>
   async executeFromLibrary(scriptId: string, params: any): Promise<Result>
   ```

4. **Advanced Execution:**
   ```typescript
   async executeParallel(scripts: ScriptTask[]): Promise<Results[]>
   async executeWithTimeout(script: string, timeout: number): Promise<Result>
   async executeWithRetry(script: string, retries: number, backoff: number): Promise<Result>
   async executeConditional(script: string, condition: () => boolean): Promise<Result>
   ```

5. **Queue Management:**
   ```typescript
   async queueScript(script: ScriptTask): Promise<string>
   async getQueueStatus(): Promise<QueueStatus>
   async cancelQueued(id: string): Promise<boolean>
   async pauseQueue(): Promise<void>
   async resumeQueue(): Promise<void>
   async clearQueue(): Promise<void>
   ```

**Priority:** P0 CRITICAL

**Estimated Effort:** 1-2 weeks

---

### Task 10.2: Discovery Service Orchestrator (PENDING)

**Current Gap:** No central discovery orchestration

**Required Implementation:**
Create `guiv2/src/renderer/services/discoveryService.ts`

```typescript
class DiscoveryService {
  // Discovery orchestration
  async runDiscovery(config: DiscoveryConfig): Promise<DiscoveryResult>
  async scheduleDiscovery(config: ScheduledDiscovery): Promise<void>
  async cancelDiscovery(id: string): Promise<void>
  async pauseDiscovery(id: string): Promise<void>
  async resumeDiscovery(id: string): Promise<void>

  // Discovery templates
  async getTemplates(): Promise<DiscoveryTemplate[]>
  async saveTemplate(template: DiscoveryTemplate): Promise<void>
  async deleteTemplate(id: string): Promise<void>
  async applyTemplate(templateId: string): Promise<DiscoveryConfig>

  // Discovery history
  async getHistory(filter?: HistoryFilter): Promise<DiscoveryRun[]>
  async getResults(runId: string): Promise<DiscoveryResult>
  async deleteHistory(runId: string): Promise<void>
  async exportHistory(runId: string, format: 'json' | 'csv'): Promise<void>

  // Incremental discovery
  async runIncremental(lastRunId: string): Promise<DiscoveryResult>
  async compareResults(runId1: string, runId2: string): Promise<ComparisonResult>

  // Discovery validation
  async validateConfig(config: DiscoveryConfig): Promise<ValidationResult>
  async testConnection(config: DiscoveryConfig): Promise<ConnectionResult>
}
```

**Priority:** P1 HIGH

**Estimated Effort:** 1 week

---

### Task 10.3-10.50: Remaining Critical Services (PENDING)

**Data Services (Priority: P1):**
- CsvDataServiceNew - Enhanced CSV handling
- AsyncDataLoadingService - Background data loading
- CacheAwareFileWatcherService - Smart file watching (✅ PARTIAL - basic file watcher exists)
- DataTransformationService - Data transforms
- DataValidationService - Validation rules
- ExportService - Multi-format export (enhance existing)
- ImportService - Multi-format import
- PaginationService - Advanced pagination
- FilteringService - Advanced filtering
- SortingService - Multi-column sorting

**Migration Services (Priority: P0 CRITICAL):**
- MigrationOrchestrationService - Multi-wave coordination
- MigrationExecutionService - Execution engine
- MigrationValidationService - Pre-flight checks
- ResourceMappingService - Resource mapping
- ConflictResolutionService - Conflict handling
- RollbackService - Rollback capability
- DeltaSyncService - Delta sync
- CutoverService - Cutover automation
- CoexistenceService - Coexistence management
- MigrationReportingService - Migration reports

**Security Services (Priority: P1):**
- AuthenticationService - User authentication
- AuthorizationService - RBAC
- TokenManagementService - Token handling
- EncryptionService - Data encryption
- AuditService - Audit logging
- ComplianceService - Compliance checks
- SecurityScanningService - Security scans

**UI/UX Services (Priority: P2):**
- ThemeService - Theme management (✅ PARTIAL - theme store exists)
- LayoutService - Layout persistence
- ProgressService - Progress tracking
- CommandPaletteService - Command registry
- KeyboardShortcutService - Shortcut management
- DragDropService - Drag-drop utilities
- PrintService - Print functionality
- ClipboardService - Clipboard operations
- UndoRedoService - Undo/redo stack

**Infrastructure Services (Priority: P1):**
- BackgroundTaskQueueService - Background tasks
- ScheduledTaskService - Task scheduling
- LoggingService - Centralized logging
- ErrorHandlingService - Global error handler
- PerformanceMonitoringService - Performance tracking (✅ PARTIAL - performanceMonitor exists)
- ConnectionPoolingService - Connection pooling
- StateManagementService - State sync
- EventAggregatorService - Event bus
- WebSocketService - Real-time communication
- RealTimeUpdateService - Live updates

---

## 🚧 Phase 11: Data Models & Converters

**Goal:** Complete remaining data models and create converter utilities

**Status:** 45/42 models (110% - models complete!), 0/39 converters (0%)

### Task 11.1: Converter Utilities (PENDING)

**Current Gap:** All 39 WPF value converters need TypeScript utility equivalents

**Required Implementation:**
Create `guiv2/src/renderer/lib/converters/` directory with:

```typescript
// 1. BooleanToVisibilityConverter → booleanToVisibility()
export const booleanToVisibility = (value: boolean): 'visible' | 'hidden' =>
  value ? 'visible' : 'hidden';

// 2. ByteSizeConverter → formatBytes()
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

// 3. DateTimeConverter → formatDateTime()
export const formatDateTime = (date: Date | string, format?: string): string => {
  // Implementation using date-fns
};

// 4-39. Remaining converters...
```

**Complete List of Required Converters:**
1. BooleanToVisibilityConverter
2. ByteSizeConverter
3. DateTimeConverter
4. EnvironmentTypeToColorConverter
5. EnvironmentTypeToIconConverter
6. InverseBooleanConverter
7. InverseBooleanToVisibilityConverter
8. NullToVisibilityConverter
9. NumberToVisibilityConverter
10. PercentageConverter
11. StringToVisibilityConverter
12. ThemeToColorConverter
13. CountToVisibilityConverter
14. EmptyStringToVisibilityConverter
15. EnumToStringConverter
16. ZeroToVisibilityConverter
17. BooleanToColorConverter
18. StatusToColorConverter
19. PriorityToColorConverter
20. TypeToIconConverter
21. ArrayLengthConverter
22. TimeSpanConverter
23. CurrencyConverter
24. PhoneNumberConverter
25. UrlConverter
26. EmailConverter
27. TruncateConverter
28. UpperCaseConverter
29. LowerCaseConverter
30. TitleCaseConverter
31. PluralizeConverter
32. HumanizeConverter
33. RelativeDateConverter
34. DurationConverter
35. ProgressBarConverter
36. HealthStatusConverter
37. SeverityLevelConverter
38. ConnectionStatusConverter
39. MigrationStatusConverter

**Priority:** P2 MEDIUM

**Estimated Effort:** 1 week

---

## 🚧 Phase 12: Remaining Views Implementation

**Goal:** Complete all remaining specialized views

**Status:** 44/102 views (43%)

### Remaining Views by Category

**Analytics & Dashboards (6 remaining):**
- CustomReportBuilderView
- ScheduledReportsView
- ReportTemplatesView
- DataVisualizationView
- TrendAnalysisView
- BenchmarkingView

**Asset Management (3 remaining):**
- ComputerInventoryView
- ServerInventoryView
- NetworkDeviceInventoryView

**Security & Compliance (5 remaining):**
- SecurityAuditView
- ComplianceReportView
- RiskAssessmentView
- ThreatAnalysisView
- PolicyManagementView

**Administration (8 remaining):**
- UserManagementView
- RoleManagementView
- PermissionsView
- AuditLogView
- SystemConfigurationView
- BackupRestoreView
- LicenseActivationView
- AboutView

**Advanced Features (12 remaining):**
- WorkflowAutomationView
- ScriptLibraryView
- CustomFieldsView
- TagManagementView
- BulkOperationsView
- DataImportExportView
- APIManagementView
- WebhooksView
- NotificationRulesView
- HealthMonitoringView
- PerformanceDashboardView
- DiagnosticsView

**Priority:** P2 MEDIUM

**Estimated Effort:** 6-8 weeks (with team)

---

## 🚧 Phase 13: Testing & Quality Assurance

**Goal:** Achieve 80% test coverage and ensure quality

**Status:** 10% Complete (3 test files exist)

### Task 13.1: Unit Tests for All Views (PENDING)

**Current Coverage:** ~10%
**Target Coverage:** 80%

**Required:**
- Create `.test.tsx` for every view component
- Test rendering
- Test user interactions
- Test error states
- Test loading states
- Test data display

**Priority:** P0 CRITICAL

---

### Task 13.2: Integration Tests for Services (PENDING)

**Required:**
- Test PowerShell service with real scripts
- Test file operations
- Test IPC communication
- Test state management
- Test data persistence

**Priority:** P1 HIGH

---

### Task 13.3: E2E Tests for Critical Workflows (PENDING)

See Task 8.2 above.

**Priority:** P0 CRITICAL

---

### Task 13.4: Performance Testing (PENDING)

**Required:**
- Memory leak detection
- Bundle size monitoring
- Render performance testing
- Data grid performance (100K rows)
- Initial load time testing
- Route transition speed

**Priority:** P1 HIGH

---

## 🚧 Phase 14: Documentation & Deployment

**Goal:** Complete documentation and deployment readiness

**Status:** 5% Complete

### Task 14.1: API Documentation (PENDING)

**Required:**
- Document all IPC APIs
- Document all services
- Document all stores
- Document all hooks
- Generate TypeDoc documentation

**Priority:** P2 MEDIUM

---

### Task 14.2: User Documentation (PENDING)

**Required:**
- User guide
- Quick start guide
- Feature documentation
- Troubleshooting guide
- FAQ

**Priority:** P2 MEDIUM

---

### Task 14.3: Deployment Guide (PENDING)

**Required:**
- Installation instructions
- Configuration guide
- Environment setup
- Building for production
- Distribution packaging

**Priority:** P1 HIGH

---

### Task 14.4: Migration Guide (PENDING)

**Required:**
- Guide for migrating from C# GUI
- Data migration steps
- Configuration migration
- User training materials

**Priority:** P1 HIGH

---

## Success Criteria

### Minimum Viable Product (MVP) - Current Status: 60% Complete

- ✅ All discovery views functional (26/26 - 100%)
- ✅ Complete migration module (4/4 views - 100%)
- ⏳ PowerShell service enhanced (40% - streams needed)
- ⏳ License assignment working (needs implementation)
- ✅ Environment detection working
- ✅ Notification system operational
- ✅ File watcher service operational
- ✅ Core data models complete (45/42 - 110%)
- ✅ Critical UI components implemented (40/41 - 98%)
- ⏳ 60% test coverage (currently ~10%)

### Full Feature Parity - Current Status: 43% Complete

- ⏳ All 102 views implemented (44/102 - 43%)
- ⏳ All 130+ services operational (11/130 - 8%)
- ✅ All data models complete (45/42 - 110%)
- ✅ All UI components implemented (40/41 - 98%)
- ⏳ All 39 converters as utilities (0/39 - 0%)
- ⏳ 80% test coverage (currently ~10%)
- ⏳ Complete documentation (5%)
- ⏳ Deployment ready (25%)
- ⏳ Production validation complete (0%)

---

## Performance Targets

**Current Status:**
- Initial load: ⏳ Not measured
- View switching: ⏳ Not measured
- Data grid: ✅ Tested with 100K rows at 60 FPS
- Memory usage: ⏳ Not measured
- Bundle size: ⏳ Not measured

**Targets:**
- Initial load: <3 seconds
- View switching: <100ms
- Data grid: 100,000 rows at 60 FPS ✅
- Memory usage: <500MB baseline
- Bundle size: <5MB initial

---

## Implementation Priority (Next 4 Weeks)

**Week 1 (Current):**
1. ✅ Complete gap analysis
2. ⏳ Enhance PowerShell service (streams, parallel execution)
3. ⏳ Implement remaining analytics views (4 views)
4. ⏳ Begin bundle optimization

**Week 2:**
1. ⏳ Complete migration services (10 critical services)
2. ⏳ Implement data services (10 services)
3. ⏳ Create converter utilities (all 39)
4. ⏳ Write E2E tests for critical paths

**Week 3:**
1. ⏳ Implement remaining asset/security views (15 views)
2. ⏳ Implement UI/UX services (9 services)
3. ⏳ Write unit tests (achieve 40% coverage)
4. ⏳ Performance testing and optimization

**Week 4:**
1. ⏳ Implement remaining admin/advanced views (20 views)
2. ⏳ Complete infrastructure services (10 services)
3. ⏳ Write integration tests
4. ⏳ Documentation sprint (achieve 50% documentation)

---

## Risk Mitigation

### Critical Risks

1. **Testing Debt** (HIGH RISK)
   - Current: ~10% coverage
   - Target: 80% coverage
   - Mitigation: Dedicate Week 2 to testing, write tests alongside new features

2. **Service Implementation Backlog** (HIGH RISK)
   - Current: 11/130 services (8%)
   - Target: 130+ services (100%)
   - Mitigation: Focus on P0 services first, parallelize development

3. **Performance Unknowns** (MEDIUM RISK)
   - No performance metrics measured yet
   - Mitigation: Implement monitoring, run performance tests Week 3

4. **Documentation Gap** (MEDIUM RISK)
   - Current: 5% documented
   - Mitigation: Document as you build, dedicate Week 4 to docs

---

**Last Updated:** October 4, 2025
**Current Phase:** 7-14 (Active Development)
**Next Milestone:** Week 1 - PowerShell enhancements + Analytics views
**See FINISHED.md for completed phases 0-6 and 9**
