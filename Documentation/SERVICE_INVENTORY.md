# Service Inventory - /guiv2/ Architecture

**Generated:** 2025-10-18
**Total Services:** ~70 across main and renderer processes
**Status:** Comprehensive catalog of all services with responsibilities

---

## Overview

The /guiv2/ application uses a service-oriented architecture split across two Electron processes:
- **Main Process:** Node.js services for system operations, PowerShell execution, file I/O, database access
- **Renderer Process:** Browser services for UI operations, data transformation, caching, real-time updates

---

## Main Process Services (34+ Services)

### Infrastructure & Core (10 services)

| Service | File | Responsibility | Key Dependencies |
|---------|------|----------------|------------------|
| **configService** | `src/main/services/configService.ts` | Application configuration management, settings persistence | fs, electron-store |
| **fileService** | `src/main/services/fileService.ts` | File system operations, CSV reading/writing | fs, path |
| **fileWatcherService** | `src/main/services/fileWatcherService.ts` | Monitor file changes, trigger updates | chokidar |
| **databaseService** | `src/main/services/databaseService.ts` | SQLite database operations, query execution | better-sqlite3 |
| **backgroundTaskQueueService** | `src/main/services/backgroundTaskQueueService.ts` | Async task queuing, job scheduling | EventEmitter |
| **connectionPoolingService** | `src/main/services/connectionPoolingService.ts` | Manage connection pools for APIs/databases | |
| **cacheAwareFileWatcherService** | `src/main/services/cacheAwareFileWatcherService.ts` | File watching with cache invalidation | fileWatcherService, cache |
| **debugService** | `src/main/services/debugService.ts` | Debug logging, diagnostic information | |
| **loggingService** | `src/main/services/loggingService.ts` | Centralized logging to file/console | winston, electron-log |
| **errorHandlingService** | `src/main/services/errorHandlingService.ts` | Global error handling, crash reporting | |

### Security & Compliance (6 services)

| Service | File | Responsibility | Key Dependencies |
|---------|------|----------------|------------------|
| **authorizationService** | `src/main/services/authorizationService.ts` | Role-based access control, permissions | |
| **complianceService** | `src/main/services/complianceService.ts` | Compliance checks, policy validation | |
| **securityScanningService** | `src/main/services/securityScanningService.ts` | Security vulnerability scanning | |
| **auditService** | `src/main/services/auditService.ts` | Audit logging, change tracking | databaseService |
| **encryptionService** | `src/main/services/encryptionService.ts` | Data encryption/decryption | crypto |
| **tokenManagementService** | `src/main/services/tokenManagementService.ts` | OAuth token management, refresh logic | |

### Discovery & PowerShell (2 services)

| Service | File | Responsibility | Key Dependencies |
|---------|------|----------------|------------------|
| **powerShellService** | `src/main/services/powerShellService.ts` | Execute PowerShell scripts, session pooling, stream output | child_process |
| **environmentDetectionService** | `src/main/services/environmentDetectionService.ts` | Detect AD, Azure, M365 environments | powerShellService |

**Test Coverage:**
- powerShellService: 11/32 tests passing (34%) 🔧 **NEEDS WORK**
- environmentDetectionService: ❌ **NO TESTS**

### Migration Services (11 services)

| Service | File | Responsibility | Key Dependencies |
|---------|------|----------------|------------------|
| **migrationOrchestrationService** | `src/main/services/migrationOrchestrationService.ts` | Orchestrate migration workflows, coordinate services | All migration services |
| **migrationExecutionService** | `src/main/services/migrationExecutionService.ts` | Execute migration waves, track progress | powerShellService |
| **migrationValidationService** | `src/main/services/migrationValidationService.ts` | Pre-migration validation, readiness checks | logicEngineService |
| **migrationPlanningService** | `src/main/services/migrationPlanningService.ts` | Create migration plans, wave definitions | |
| **migrationReportingService** | `src/main/services/migrationReportingService.ts` | Generate migration reports, analytics | |
| **resourceMappingService** | `src/main/services/resourceMappingService.ts` | Map source → target resources | |
| **rollbackService** | `src/main/services/rollbackService.ts` | Rollback migrations, restore state | databaseService |
| **conflictResolutionService** | `src/main/services/conflictResolutionService.ts` | Resolve migration conflicts | |
| **deltaSyncService** | `src/main/services/deltaSyncService.ts` | Incremental synchronization | |
| **coexistenceService** | `src/main/services/coexistenceService.ts` | Manage coexistence scenarios | |
| **cutoverService** | `src/main/services/cutoverService.ts` | Final cutover operations | |

**Test Coverage:**
- ❌ **ALL UNTESTED** - Critical gap for data safety

### Integration & Scheduling (5+ services)

| Service | File | Responsibility | Key Dependencies |
|---------|------|----------------|------------------|
| **scheduledTaskService** | `src/main/services/scheduledTaskService.ts` | Scheduled jobs, cron-like execution | node-cron |
| **webSocketService** | `src/main/services/webSocketService.ts` | WebSocket server, real-time communication | ws |
| **appRegistrationService** | `src/main/services/appRegistrationService.ts` | Azure AD app registration management | |
| **targetProfileService** | `src/main/services/targetProfileService.ts` | Target environment profiles | |
| **connectionTestingService** | `src/main/services/connectionTestingService.ts` | Test connections to APIs/services | |

### Business Logic (2 services)

| Service | File | Responsibility | Key Dependencies |
|---------|------|----------------|------------------|
| **logicEngineService** | `src/main/services/logicEngineService.ts` | Business logic, fuzzy matching, user details | CSV files, cacheService |
| **projectService** | `src/main/services/projectService.ts` | Project management, metadata | databaseService |

**Test Coverage:**
- logicEngineService: 13/26 tests passing (50%) 🔧 **NEEDS IMPROVEMENT**
- projectService: ❌ **NO TESTS**

---

## Renderer Process Services (35+ Services)

### Data & State (4 services)

| Service | File | Responsibility | Key Dependencies |
|---------|------|----------------|------------------|
| **csvDataService** | `src/renderer/services/csvDataService.ts` | Parse CSV, transform to JSON | papaparse |
| **cacheService** | `src/renderer/services/cacheService.ts` | LRU/LFU caching, TTL, statistics | ✅ 100% tested (28/28) |
| **stateManagementService** | `src/renderer/services/stateManagementService.ts` | State persistence, hydration | Zustand stores |
| **discoveryService** | `src/renderer/services/discoveryService.ts` | Discovery orchestration, result caching | electronAPI |

**Test Coverage:**
- cacheService: ✅ 100% (28/28)
- Others: ❌ **NO TESTS**

### UI & UX (7 services)

| Service | File | Responsibility | Key Dependencies |
|---------|------|----------------|------------------|
| **themeService** | `src/renderer/services/themeService.ts` | Theme management, dark mode, presets, accessibility | ✅ 100% tested (26/26) |
| **notificationService** | `src/renderer/services/notificationService.ts` | Toast notifications, alerts | react-toastify |
| **layoutService** | `src/renderer/services/layoutService.ts` | Layout persistence, responsive handling | |
| **commandPaletteService** | `src/renderer/services/commandPaletteService.ts` | Command palette logic, search | Fuse.js |
| **keyboardShortcutService** | `src/renderer/services/keyboardShortcutService.ts` | Keyboard shortcut registration | |
| **dragDropService** | `src/renderer/services/dragDropService.ts` | Drag & drop operations | react-dnd |
| **clipboardService** | `src/renderer/services/clipboardService.ts` | Clipboard operations | |

**Test Coverage:**
- themeService: ✅ 100% (26/26)
- Others: ❌ **NO TESTS**

### Data Operations (8 services)

| Service | File | Responsibility | Key Dependencies |
|---------|------|----------------|------------------|
| **filteringService** | `src/renderer/services/filteringService.ts` | Data filtering, query building | |
| **sortingService** | `src/renderer/services/sortingService.ts` | Multi-column sorting, custom comparators | |
| **paginationService** | `src/renderer/services/paginationService.ts` | Client-side pagination, page calculations | |
| **dataValidationService** | `src/renderer/services/dataValidationService.ts` | Schema validation, rules engine | joi, yup |
| **dataTransformationService** | `src/renderer/services/dataTransformationService.ts` | Data mapping, transformation pipelines | |
| **exportService** | `src/renderer/services/exportService.ts` | Export to CSV/Excel/PDF | xlsx, jsPDF |
| **importService** | `src/renderer/services/importService.ts` | Import from various formats | xlsx, papaparse |
| **printService** | `src/renderer/services/printService.ts` | Print preview, PDF generation | |

**Test Coverage:**
- ❌ **ALL UNTESTED**

### Monitoring & Quality (4 services)

| Service | File | Responsibility | Key Dependencies |
|---------|------|----------------|------------------|
| **performanceMonitoringService** | `src/renderer/services/performanceMonitoringService.ts` | FPS, memory, performance alerts, baselines | ✅ 100% tested (22/22) |
| **errorHandlingService** | `src/renderer/services/errorHandlingService.ts` | Error boundaries, global error handling | React ErrorBoundary |
| **loggingService** | `src/renderer/services/loggingService.ts` | Client-side logging, IPC to main | electronAPI |
| **validationService** | `src/renderer/services/validationService.ts` | Form validation, business rules | |

**Test Coverage:**
- performanceMonitoringService: ✅ 100% (22/22)
- Others: ❌ **NO TESTS**

### Real-Time & Integration (5 services)

| Service | File | Responsibility | Key Dependencies |
|---------|------|----------------|------------------|
| **realTimeUpdateService** | `src/renderer/services/realTimeUpdateService.ts` | Real-time sync, optimistic updates, conflict resolution, offline queue | crypto, EventEmitter |
| **webhookService** | `src/renderer/services/webhookService.ts` | Webhook management, retry logic, payload validation | ✅ 80% tested (20/25) |
| **eventAggregatorService** | `src/renderer/services/eventAggregatorService.ts` | Publish-subscribe event bus | EventEmitter |
| **fileWatcherService** | `src/renderer/services/fileWatcherService.ts` | Monitor file changes from renderer | electronAPI |
| **powerShellService** | `src/renderer/services/powerShellService.ts` | PowerShell execution proxy | electronAPI |

**Test Coverage:**
- webhookService: 🔧 80% (20/25)
- Others: ❌ **NO TESTS**

### Advanced Features (7+ services)

| Service | File | Responsibility | Key Dependencies |
|---------|------|----------------|------------------|
| **authenticationService** | `src/renderer/services/authenticationService.ts` | User authentication, session management | |
| **undoRedoService** | `src/renderer/services/undoRedoService.ts` | Undo/redo stack, command pattern | |
| **asyncDataLoadingService** | `src/renderer/services/asyncDataLoadingService.ts` | Async data loading, cancellation | |
| **progressService** | `src/renderer/services/progressService.ts` | Progress tracking, percentage calculations | |

**Test Coverage:**
- ❌ **ALL UNTESTED**

---

## Service Dependencies Graph

### High-Level Flow
```
UI Components
    ↓
Renderer Services (35+)
    ↓ (IPC via electronAPI)
Main Services (34+)
    ↓
System Resources (PowerShell, File System, Database)
```

### Critical Service Chains

**Discovery Workflow:**
```
discoveryService (renderer)
  → electronAPI.executeModule
    → powerShellService (main)
      → environmentDetectionService (main)
        → CSV output
          → fileWatcherService (main)
            → cacheAwareFileWatcherService (main)
              → cache invalidation
                → UI update
```

**Migration Workflow:**
```
Migration UI
  → migrationExecutionService (main)
    → migrationOrchestrationService (main)
      → migrationValidationService (main)
      → rollbackService (main)
      → conflictResolutionService (main)
      → migrationReportingService (main)
    → powerShellService (main)
      → targetProfileService (main)
```

**Real-Time Updates:**
```
Component
  → realTimeUpdateService (renderer)
    → webSocketService (main)
      → conflict resolution
        → eventAggregatorService (renderer)
          → UI update
```

---

## Test Coverage Summary

### By Category

| Category | Tested | Untested | Coverage % | Status |
|----------|--------|----------|------------|--------|
| **Main Infrastructure** | 0 | 10 | 0% | ❌ **CRITICAL** |
| **Main Security** | 0 | 6 | 0% | ❌ **CRITICAL** |
| **Main Discovery** | 1 | 1 | 50% | 🔧 **NEEDS WORK** |
| **Main Migration** | 0 | 11 | 0% | ❌ **CRITICAL** |
| **Main Integration** | 0 | 5 | 0% | ❌ **CRITICAL** |
| **Main Business Logic** | 1 | 1 | 50% | 🔧 **NEEDS WORK** |
| **Renderer Data** | 1 | 3 | 25% | 🔧 **NEEDS WORK** |
| **Renderer UI** | 1 | 6 | 14% | ❌ **GAP** |
| **Renderer Data Ops** | 0 | 8 | 0% | ❌ **CRITICAL** |
| **Renderer Monitoring** | 1 | 3 | 25% | 🔧 **NEEDS WORK** |
| **Renderer Real-Time** | 1 | 4 | 20% | ❌ **GAP** |
| **Renderer Advanced** | 0 | 7 | 0% | ❌ **CRITICAL** |
| **TOTAL** | **6** | **65** | **~9%** | ❌ **CRITICAL** |

### Services with Tests

1. ✅ **cacheService** (renderer) - 28/28 (100%)
2. ✅ **themeService** (renderer) - 26/26 (100%)
3. ✅ **performanceMonitoringService** (renderer) - 22/22 (100%)
4. 🔧 **webhookService** (renderer) - 20/25 (80%)
5. 🔧 **logicEngineService** (main) - 13/26 (50%)
6. 🔧 **powerShellService** (main) - 11/32 (34%)

### Priority for Test Addition

**🔴 CRITICAL (Add Immediately):**
1. migrationExecutionService - Data loss risk
2. rollbackService - Data safety critical
3. migrationValidationService - Pre-flight checks
4. powerShellService - Fix existing 21 failures
5. logicEngineService - Fix existing 13 failures

**🟡 HIGH (Add Next Sprint):**
6. webSocketService - Real-time reliability
7. databaseService - Data integrity
8. csvDataService - Data accuracy
9. discoveryService - Core functionality
10. exportService - User-facing feature

**🟢 MEDIUM (Future Sprints):**
- All remaining renderer data operation services
- Authentication & authorization services
- File watching services
- Integration services

---

## IPC Communication Map

### Channels (Main → Renderer)

| Channel | Service | Purpose |
|---------|---------|---------|
| `discovery:execute` | discoveryService | Execute discovery module |
| `migration:execute` | migrationExecutionService | Execute migration wave |
| `powershell:run` | powerShellService | Run PowerShell script |
| `database:query` | databaseService | Execute SQL query |
| `file:read` | fileService | Read file contents |
| `file:write` | fileService | Write file contents |
| `config:get` | configService | Get configuration value |
| `config:set` | configService | Set configuration value |
| `websocket:connect` | webSocketService | Establish WebSocket connection |
| `logicEngine:getUser` | logicEngineService | Get user details |
| `logicEngine:analyze` | logicEngineService | Analyze migration complexity |

### Events (Main → Renderer)

| Event | Source | Purpose |
|-------|--------|---------|
| `progress` | powerShellService | Script execution progress |
| `output` | powerShellService | Script output stream |
| `discovery:complete` | discoveryService | Discovery completed |
| `migration:progress` | migrationExecutionService | Migration progress update |
| `websocket:message` | webSocketService | WebSocket message received |
| `file:changed` | fileWatcherService | File changed notification |

---

## Performance Characteristics

### Service Response Times (Estimated)

| Service | Typical Response | Notes |
|---------|------------------|-------|
| cacheService.get() | <1ms | In-memory lookup |
| discoveryService.execute() | 10s-5min | Depends on environment size |
| migrationExecutionService.execute() | 1min-2hr | Depends on wave size |
| powerShellService.run() | 100ms-30s | Depends on script complexity |
| logicEngineService.getUser() | 50-200ms | CSV scan + fuzzy match |
| exportService.toExcel() | 100ms-2s | Depends on row count |
| realTimeUpdateService.sync() | <50ms | WebSocket latency |

### Memory Usage (Estimated)

| Service | Memory | Notes |
|---------|--------|-------|
| cacheService | 10-100MB | Configurable max size |
| csvDataService | 50-500MB | Depends on CSV size |
| performanceMonitoringService | <5MB | Lightweight monitoring |
| realTimeUpdateService | 10-50MB | Update queue + history |

---

## Singleton vs Instance Patterns

### Singletons (Shared State)
Most services are implemented as singletons:
- cacheService (single cache instance)
- themeService (single theme state)
- performanceMonitoringService (single metrics collector)
- eventAggregatorService (single event bus)

### Instances (Multiple Allowed)
- None identified (all services appear to be singletons)

**Note:** Singleton pattern simplifies testing but requires careful state reset in test setup.

---

## Configuration Dependencies

### Environment Variables
| Variable | Used By | Purpose |
|----------|---------|---------|
| `NODE_ENV` | All services | Development/production mode |
| `DEBUG` | debugService | Enable debug logging |
| `POWERSHELL_PATH` | powerShellService | Custom PowerShell executable |

### Config Files
| File | Services | Purpose |
|------|----------|---------|
| `config.json` | configService | User preferences |
| `profiles.json` | profileService | Source/target profiles |
| `themes.json` | themeService | Theme definitions |

---

## Next Steps for Service Improvements

### Immediate (This Sprint)
1. Add tests for migration services (data safety)
2. Fix failing powerShellService tests (21 failures)
3. Fix failing logicEngineService tests (13 failures)
4. Document IPC API with TypeScript interfaces

### Short-term (Next 2 Sprints)
5. Add integration tests for service chains
6. Create service dependency diagram (Mermaid)
7. Add performance benchmarks
8. Document error handling patterns

### Long-term (Next Quarter)
9. Refactor services to use dependency injection
10. Add circuit breakers for external services
11. Implement service health checks
12. Add distributed tracing

---

**END OF SERVICE INVENTORY**
*Last Updated: 2025-10-18*
*Services Catalogued: ~70*
*Test Coverage: ~9%*
*Target Coverage: 50%+*
