# CLAUDE.md Additions - Critical Gap Closure Instructions

Add the following phases to CLAUDE.md after Phase 8:

---

## Phase 9: Critical Discovery Views Implementation

**Goal:** Implement the 26 missing discovery views that are essential for core functionality

### Task 9.1: Active Directory Discovery View
**Delegate to:** React_Component_Architect WITH State_Management_Specialist

**Current Gap:** No Active Directory discovery view exists

**Required Implementation:**
Create `guiv2/src/renderer/views/discovery/ActiveDirectoryDiscoveryView.tsx`

**Features Required:**
- Domain controller detection
- Forest/Domain enumeration
- OU structure visualization
- User/Group/Computer discovery options
- GPO discovery
- Trust relationship mapping
- Schema information
- LDAP query builder
- Scheduled discovery
- Incremental discovery support

**Logic Hook:** `guiv2/src/renderer/hooks/useActiveDirectoryDiscoveryLogic.ts`

**State Management:**
- Discovery configuration state
- Progress tracking
- Results caching
- Error handling

**PowerShell Integration:**
```typescript
await window.electronAPI.executeModule({
  modulePath: 'Modules/Discovery/ActiveDirectoryDiscovery.psm1',
  functionName: 'Invoke-ADDiscovery',
  parameters: {
    Forest: selectedForest,
    IncludeOUs: true,
    IncludeGPOs: true,
    IncludeTrusts: true
  }
});
```

**Acceptance Criteria:**
- Can discover all AD objects
- Supports scheduled discovery
- Exports to CSV/JSON
- Real-time progress updates
- Cancellation support

---

### Task 9.2: Application Discovery View
**Delegate to:** React_Component_Architect

**Current Gap:** No application inventory discovery

**Required Implementation:**
Create `guiv2/src/renderer/views/discovery/ApplicationDiscoveryView.tsx`

**Features Required:**
- Installed software discovery
- Running processes discovery
- Services discovery
- Registry scanning
- File system scanning
- Network port scanning
- Application dependencies
- License detection
- Version tracking
- Update status

**Acceptance Criteria:**
- Discovers all installed applications
- Identifies application dependencies
- Exports detailed inventory
- Supports remote discovery

---

### Task 9.3: Infrastructure Discovery Hub
**Delegate to:** React_Component_Architect

**Current Gap:** No central discovery dashboard

**Required Implementation:**
Create `guiv2/src/renderer/views/discovery/DiscoveryView.tsx`

**Features Required:**
- Discovery module tiles (grid layout)
- Quick launch for each discovery type
- Recent discovery history
- Discovery schedule calendar
- Discovery templates
- Discovery status dashboard
- Discovery queue management
- Resource impact monitoring

**UI Requirements:**
```typescript
interface DiscoveryTile {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  lastRun?: Date;
  status: 'idle' | 'running' | 'completed' | 'failed';
  resultCount?: number;
  route: string;
}
```

**Acceptance Criteria:**
- All discovery modules accessible
- Shows discovery status
- Quick launch capability
- Discovery history visible

---

### Task 9.4-9.26: Remaining Discovery Views
**Delegate to:** React_Component_Architect (distribute across team)

Implement the following discovery views using the same pattern:

4. **AWSCloudInfrastructureDiscoveryView** - AWS resources
5. **AzureInfrastructureDiscoveryView** - Azure resources beyond AD
6. **ConditionalAccessPoliciesDiscoveryView** - CA policies
7. **DataLossPreventionDiscoveryView** - DLP policies
8. **ExchangeDiscoveryView** - Exchange/mailboxes
9. **FileSystemDiscoveryView** - File shares/permissions
10. **GoogleWorkspaceDiscoveryView** - Google Workspace
11. **HyperVDiscoveryView** - Hyper-V infrastructure
12. **IdentityGovernanceDiscoveryView** - Identity governance
13. **IntuneDiscoveryView** - Intune/MDM
14. **LicensingDiscoveryView** - License inventory
15. **NetworkDiscoveryView** - Network infrastructure
16. **Office365DiscoveryView** - O365 services
17. **OneDriveDiscoveryView** - OneDrive data
18. **PowerPlatformDiscoveryView** - PowerApps/Flow
19. **SecurityInfrastructureDiscoveryView** - Security tools
20. **SharePointDiscoveryView** - SharePoint sites
21. **SQLServerDiscoveryView** - SQL databases
22. **TeamsDiscoveryView** - Teams/channels
23. **VMwareDiscoveryView** - VMware infrastructure
24. **WebServerConfigurationDiscoveryView** - Web servers
25. **DatabasesView** - Database inventory
26. **EnvironmentDetectionView** - Auto-detect environment

---

## Phase 10: Core Services Implementation

**Goal:** Implement the 50 most critical missing services

### Task 10.1: Enhanced PowerShell Execution Service
**Delegate to:** ElectronMain_Process_Specialist

**Current Gap:** Basic PowerShell service lacks advanced features

**Required Enhancements to** `guiv2/src/main/services/powerShellService.ts`:

```typescript
class EnhancedPowerShellService extends PowerShellExecutionService {
  // Module discovery
  async discoverModules(): Promise<ModuleInfo[]>

  // Script library management
  async getScriptLibrary(): Promise<Script[]>
  async saveScript(script: Script): Promise<void>

  // Stream handling
  onOutputStream(callback: (data: string) => void): void
  onErrorStream(callback: (data: string) => void): void
  onProgressStream(callback: (progress: Progress) => void): void
  onVerboseStream(callback: (data: string) => void): void
  onDebugStream(callback: (data: string) => void): void

  // Advanced execution
  async executeParallel(scripts: ScriptTask[]): Promise<Results[]>
  async executeWithTimeout(script: string, timeout: number): Promise<Result>
  async executeWithRetry(script: string, retries: number): Promise<Result>

  // Queue management
  async queueScript(script: ScriptTask): Promise<string>
  async getQueueStatus(): Promise<QueueStatus>
  async cancelQueued(id: string): Promise<boolean>
}
```

**Acceptance Criteria:**
- All PowerShell streams handled
- Parallel execution works
- Queue management works
- Module discovery works

---

### Task 10.2: Discovery Service Orchestrator
**Delegate to:** State_Management_Specialist

**Current Gap:** No central discovery orchestration

**Required Implementation:**
Create `guiv2/src/renderer/services/discoveryService.ts`

```typescript
class DiscoveryService {
  // Discovery orchestration
  async runDiscovery(config: DiscoveryConfig): Promise<DiscoveryResult>
  async scheduleDiscovery(config: ScheduledDiscovery): Promise<void>
  async cancelDiscovery(id: string): Promise<void>

  // Discovery templates
  async getTemplates(): Promise<DiscoveryTemplate[]>
  async saveTemplate(template: DiscoveryTemplate): Promise<void>

  // Discovery history
  async getHistory(filter?: HistoryFilter): Promise<DiscoveryRun[]>
  async getResults(runId: string): Promise<DiscoveryResult>

  // Incremental discovery
  async runIncremental(lastRunId: string): Promise<DiscoveryResult>

  // Discovery validation
  async validateConfig(config: DiscoveryConfig): Promise<ValidationResult>
}
```

---

### Task 10.3: Notification Service
**Delegate to:** React_Component_Architect

**Current Gap:** No notification system

**Required Implementation:**
Create `guiv2/src/renderer/services/notificationService.ts`

```typescript
class NotificationService {
  // Toast notifications
  showSuccess(message: string, options?: NotificationOptions): void
  showError(message: string, options?: NotificationOptions): void
  showWarning(message: string, options?: NotificationOptions): void
  showInfo(message: string, options?: NotificationOptions): void

  // Notification center
  addNotification(notification: Notification): void
  getNotifications(): Notification[]
  markAsRead(id: string): void
  clearAll(): void

  // System tray notifications
  showSystemNotification(title: string, body: string): void
}
```

---

### Task 10.4-10.50: Remaining Critical Services
**Delegate to:** Various specialists

Implement these services following the established patterns:

**Data Services:**
4. CsvDataServiceNew
5. AsyncDataLoadingService
6. CacheAwareFileWatcherService
7. DataTransformationService
8. DataValidationService
9. ExportService (enhance existing)
10. ImportService
11. PaginationService
12. FilteringService
13. SortingService

**Migration Services:**
14. MigrationPlanningService
15. MigrationExecutionService
16. MigrationValidationService
17. ResourceMappingService
18. ConflictResolutionService
19. RollbackService
20. DeltaSyncService
21. CutoverService
22. CoexistenceService
23. MigrationReportingService

**Security Services:**
24. AuthenticationService
25. AuthorizationService
26. TokenManagementService
27. EncryptionService
28. AuditService
29. ComplianceService
30. SecurityScanningService

**UI/UX Services:**
31. ThemeService
32. LayoutService
33. ProgressService
34. CommandPaletteService
35. KeyboardShortcutService
36. DragDropService
37. PrintService
38. ClipboardService
39. UndoRedoService

**Infrastructure Services:**
40. BackgroundTaskQueueService
41. ScheduledTaskService
42. LoggingService
43. ErrorHandlingService
44. PerformanceMonitoringService
45. ConfigurationService (enhance)
46. ConnectionPoolingService
47. StateManagementService
48. EventAggregatorService
49. WebSocketService
50. RealTimeUpdateService

---

## Phase 11: Data Models Implementation

**Goal:** Implement all 35 missing data models

### Task 11.1: Discovery Models
**Delegate to:** TypeScript_Typing_Guardian

**Current Gap:** No discovery data structures

**Required Implementation:**
Create `guiv2/src/renderer/types/models/discovery.ts`

```typescript
// Base discovery types
export interface DiscoveryConfig {
  id: string;
  name: string;
  type: DiscoveryType;
  schedule?: CronExpression;
  parameters: Record<string, any>;
  credentials?: CredentialReference;
  timeout?: number;
  retryPolicy?: RetryPolicy;
}

export interface DiscoveryResult {
  id: string;
  configId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  itemsDiscovered: number;
  errors: DiscoveryError[];
  warnings: DiscoveryWarning[];
  data: any[];
}

// Specific discovery types
export interface ADDiscoveryResult extends DiscoveryResult {
  forest: string;
  domains: DomainInfo[];
  users: ADUser[];
  groups: ADGroup[];
  computers: ADComputer[];
  ous: OrganizationalUnit[];
  gpos: GroupPolicy[];
  trusts: TrustRelationship[];
}

export interface ApplicationDiscoveryResult extends DiscoveryResult {
  applications: Application[];
  dependencies: ApplicationDependency[];
  licenses: LicenseInfo[];
  updates: UpdateInfo[];
}

// ... continue for all discovery types
```

---

### Task 11.2: Migration Models
**Delegate to:** TypeScript_Typing_Guardian

**Required Implementation:**
Create `guiv2/src/renderer/types/models/migration.ts`

```typescript
export interface MigrationProject {
  id: string;
  name: string;
  description: string;
  sourceEnvironment: Environment;
  targetEnvironment: Environment;
  waves: MigrationWave[];
  mappings: ResourceMapping[];
  schedule: MigrationSchedule;
  status: ProjectStatus;
}

export interface MigrationWave {
  id: string;
  projectId: string;
  name: string;
  sequence: number;
  users: string[];
  resources: Resource[];
  dependencies: Dependency[];
  preChecks: ValidationCheck[];
  postChecks: ValidationCheck[];
  rollbackPlan: RollbackPlan;
}

export interface ResourceMapping {
  id: string;
  sourceId: string;
  sourceType: ResourceType;
  sourceName: string;
  targetId?: string;
  targetType?: ResourceType;
  targetName?: string;
  mappingStatus: MappingStatus;
  conflicts: MappingConflict[];
  transformations: Transformation[];
}

// ... continue for all migration types
```

---

### Task 11.3-11.35: Remaining Models
**Delegate to:** TypeScript_Typing_Guardian

Implement all remaining models:

**Asset Models:**
- AssetData
- ComputerData
- ServerData
- NetworkDeviceData
- StorageData

**Security Models:**
- SecurityGroup
- Permission
- Policy
- Compliance
- Audit

**Application Models:**
- Application
- Database
- WebServer
- Service
- Process

**Infrastructure Models:**
- NetworkTopology
- CloudResource
- VirtualMachine
- Container
- LoadBalancer

---

## Phase 12: Critical UI Components

**Goal:** Implement the 17 missing critical UI components

### Task 12.1: Breadcrumb Navigation
**Delegate to:** React_Component_Architect

**Current Gap:** No breadcrumb navigation

**Required Implementation:**
Create `guiv2/src/renderer/components/organisms/BreadcrumbNavigation.tsx`

```typescript
interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items,
  separator = <ChevronRight className="w-4 h-4" />,
  maxItems = 5,
  className
}) => {
  // Implementation with overflow handling
  // Keyboard navigation support
  // ARIA labels for accessibility
  // Responsive design
};
```

---

### Task 12.2: Notification Center
**Delegate to:** React_Component_Architect

**Required Implementation:**
Create `guiv2/src/renderer/components/organisms/NotificationCenter.tsx`

Features:
- Toast notifications
- Notification history
- Notification categories
- Mark as read/unread
- Clear all
- Sound/visual alerts
- Priority levels
- Action buttons

---

### Task 12.3: Loading Overlay
**Delegate to:** React_Component_Architect

**Required Implementation:**
Create `guiv2/src/renderer/components/molecules/LoadingOverlay.tsx`

Features:
- Progress bar
- Cancel button
- Status message
- Estimated time
- Blur background
- Spinner animation

---

### Task 12.4-12.17: Remaining Components

4. **EmptyStateView** - Empty state handling
5. **ValidationSummaryPanel** - Validation display
6. **AnimatedMetricCard** - KPI cards
7. **ChartControls** - Chart components
8. **DataExportWizard** - Export wizard
9. **DragDropListBox** - Drag-drop lists
10. **FilterableDataGrid** - Advanced grid
11. **AdvancedFilteringUI** - Filter builder
12. **BusyIndicator** - Busy states
13. **DockingPanelContainer** - Dockable panels
14. **EnhancedTooltipControl** - Rich tooltips
15. **FileSystemMigrationControl** - File migration
16. **OptimizedFormPanel** - Form layouts
17. **QuickActionsBar** - Quick action toolbar

---

## Phase 13: Testing & Quality Assurance

**Goal:** Achieve 80% test coverage and ensure quality

### Task 13.1: Unit Tests for All Views
**Delegate to:** E2E_Testing_Cypress_Expert

Write comprehensive tests for all views.

### Task 13.2: Integration Tests for Services
**Delegate to:** E2E_Testing_Cypress_Expert

Test all service integrations.

### Task 13.3: E2E Tests for Critical Workflows
**Delegate to:** E2E_Testing_Cypress_Expert

Test complete user journeys.

### Task 13.4: Performance Testing
**Delegate to:** Performance_Optimization_Expert

Ensure all performance requirements are met.

---

## Phase 14: Documentation & Deployment

**Goal:** Complete documentation and deployment readiness

### Task 14.1: API Documentation
**Delegate to:** Documentation_Specialist

Document all APIs and services.

### Task 14.2: User Documentation
**Delegate to:** Documentation_Specialist

Create user guides and help content.

### Task 14.3: Deployment Guide
**Delegate to:** DevOps_Specialist

Create deployment and configuration guides.

### Task 14.4: Migration Guide
**Delegate to:** Documentation_Specialist

Guide for migrating from C# GUI to guiv2.

---

## Critical Success Metrics

### Must Achieve Before Production:
- ✅ All 102 views implemented
- ✅ All critical services operational
- ✅ All data models defined
- ✅ PowerShell integration complete
- ✅ Migration module fully functional
- ✅ 80% test coverage
- ✅ Performance requirements met
- ✅ Security audit passed
- ✅ Documentation complete
- ✅ User training prepared

### Performance Targets:
- Initial load: <3 seconds
- View switching: <100ms
- Data grid: 100,000 rows at 60 FPS
- Memory usage: <500MB baseline
- Bundle size: <5MB initial

### Quality Targets:
- Zero TypeScript `any` types
- ESLint: 0 errors, 0 warnings
- Accessibility: WCAG AA compliant
- Browser support: Electron latest
- Code coverage: >80%

---

## Risk Mitigation

### Critical Risks and Mitigations:

1. **Schedule Risk**
   - Mitigation: Parallel development tracks
   - Add more developers to critical paths
   - Use code generation where possible

2. **Quality Risk**
   - Mitigation: Continuous testing
   - Code reviews for all PRs
   - Automated quality gates

3. **Integration Risk**
   - Mitigation: Early PowerShell testing
   - Mock services for development
   - Integration tests from day 1

4. **Performance Risk**
   - Mitigation: Performance budgets
   - Regular performance testing
   - Optimization sprints

5. **User Adoption Risk**
   - Mitigation: User feedback loops
   - Gradual rollout
   - Training and documentation