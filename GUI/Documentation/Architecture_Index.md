# Architecture Index - M&A Discovery Suite GUI v2
**Project:** M&A Discovery Suite - GUI v2 Rewrite (WPF → Electron/React/TypeScript)
**Last Updated:** October 5, 2025
**Purpose:** Master index of all architecture documentation, component diagrams, data flows, and technical references

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Documents](#architecture-documents)
3. [Component Architecture](#component-architecture)
4. [Data Flow Architecture](#data-flow-architecture)
5. [IPC Handler Registry](#ipc-handler-registry)
6. [Type Definition Locations](#type-definition-locations)
7. [Service Layer Architecture](#service-layer-architecture)
8. [Store (State Management) Architecture](#store-state-management-architecture)
9. [Routing Architecture](#routing-architecture)
10. [PowerShell Integration](#powershell-integration)
11. [Build & Deployment](#build--deployment)

---

## Project Overview

### Mission
Execute a complete rewrite of the M&A Discovery Suite from C#/WPF to TypeScript/React/Electron with 100% feature parity and modern architecture.

### Technology Stack
```
┌─────────────────────────────────────────────────────────────┐
│                    GUI v2 Architecture                       │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Renderer Process)                                │
│  - React 18 (UI framework)                                  │
│  - TypeScript (type safety)                                 │
│  - Zustand (state management)                               │
│  - TanStack Table (data grids)                              │
│  - React Router (navigation)                                │
│  - Tailwind CSS (styling)                                   │
│  - Lucide React (icons)                                     │
│  - React DnD (drag-and-drop)                                │
├─────────────────────────────────────────────────────────────┤
│  Backend (Main Process)                                     │
│  - Electron (desktop runtime)                               │
│  - Node.js (backend logic)                                  │
│  - PowerShell Integration (discovery scripts)              │
│  - lowdb (JSON database)                                    │
│  - IPC (inter-process communication)                        │
├─────────────────────────────────────────────────────────────┤
│  Data Sources                                               │
│  - CSV files (discovery data)                               │
│  - JSON files (configuration, profiles, migration plans)    │
│  - PowerShell modules (real-time data)                      │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure
```
guiv2/
├── src/
│   ├── main/                      # Electron main process (Node.js backend)
│   │   ├── main.ts                # Entry point
│   │   ├── ipcHandlers.ts         # IPC handler registry
│   │   ├── ipcHandlers.migration.ts  # Migration-specific IPC
│   │   ├── services/              # Backend services
│   │   │   ├── powerShellService.ts  # PowerShell execution
│   │   │   ├── databaseService.ts    # lowdb integration
│   │   │   └── logicEngineService.ts # Data correlation (Epic 4)
│   │   └── config/                # Configuration files
│   │       └── ModuleRegistry.json   # Discovery modules (Epic 3)
│   │
│   ├── preload.ts                 # Secure IPC bridge
│   │
│   └── renderer/                  # React frontend (UI)
│       ├── App.tsx                # Root component
│       ├── index.css              # Global styles
│       ├── components/            # React components
│       │   ├── atoms/             # Basic UI primitives
│       │   ├── molecules/         # Composed UI elements
│       │   ├── organisms/         # Complex components
│       │   └── dialogs/           # Modal dialogs
│       ├── views/                 # Top-level page components
│       │   ├── users/             # Users view + detail
│       │   ├── computers/         # Computers view + detail
│       │   ├── groups/            # Groups view + detail
│       │   ├── migration/         # Migration planning
│       │   └── discovery/         # Discovery execution (Epic 3)
│       ├── hooks/                 # Custom React hooks (business logic)
│       ├── store/                 # Zustand state management
│       ├── types/                 # TypeScript type definitions
│       ├── services/              # Frontend-only services
│       │   └── mockData/          # Mock data generators (temp)
│       └── lib/                   # Utility functions
│
├── tailwind.config.js             # Tailwind CSS configuration
├── package.json                   # Dependencies
└── tsconfig.json                  # TypeScript configuration
```

---

## Architecture Documents

### Epic Documentation

#### Epic 0: UI/UX Parity and Foundation ✅
**Status:** Complete (100%)
**Document:** Covered in Session Summary
**Key Achievements:**
- Tailwind CSS configuration with full WPF color palette
- StatusIndicator, LoadingOverlay, BreadcrumbNavigation components
- Dark mode support
- Global styles and theming

**Reference Files:**
- `guiv2/tailwind.config.js`
- `guiv2/src/index.css`
- `guiv2/src/renderer/components/molecules/StatusIndicator.tsx`
- `guiv2/src/renderer/components/molecules/LoadingOverlay.tsx`
- `guiv2/src/renderer/components/organisms/BreadcrumbNavigation.tsx`

#### Epic 1: Core Data Views & Functionality ✅
**Status:** Complete (100%)
**Document:** Covered in Session Summary
**Key Achievements:**
- Enhanced DataTable with column visibility, context menus, export
- UserDetailView with 9-tab drill-down
- ComputerDetailView with 6-tab drill-down
- GroupDetailView with 6-tab drill-down
- Mock data generators for testing
- IPC handlers for detail projections

**Reference Files:**
- `guiv2/src/renderer/components/organisms/DataTable.tsx`
- `guiv2/src/renderer/views/users/UserDetailView.tsx`
- `guiv2/src/renderer/views/computers/ComputerDetailView.tsx`
- `guiv2/src/renderer/views/groups/GroupDetailView.tsx`
- `guiv2/src/renderer/hooks/useUserDetailLogic.ts`
- `guiv2/src/renderer/types/userDetail.ts`
- `guiv2/src/renderer/services/mockData/mockUserDetails.ts`

#### Epic 2: Migration Planning Functionality ⏳
**Status:** 80% Complete (Backend done, UI pending)
**Document:** Covered in Session Summary and Implementation Handoff Guide
**Key Achievements:**
- databaseService.ts with lowdb v7.0.1
- 12 IPC handlers for migration operations
- Profile-specific JSON persistence
- Auto-backup system (retains last 10)
- Type definitions complete

**Remaining Work:**
- Drag-and-drop UI (MigrationPlanningView)
- Wave management interface
- Schedule picker integration

**Reference Files:**
- `guiv2/src/main/services/databaseService.ts`
- `guiv2/src/main/ipcHandlers.migration.ts`
- `guiv2/src/renderer/types/migration.ts`

#### Epic 3: Discovery Module Execution 📋
**Status:** Architecture Complete (0% implementation)
**Document:** `Epic3_Discovery_Module_Execution_Architecture.md` (1,500+ lines)
**Location:** `D:\Scripts\UserMandA\GUI\Documentation\Epic3_Discovery_Module_Execution_Architecture.md`

**Architecture Highlights:**
- PowerShell streaming service already functional
- Module registry design (30+ discovery modules)
- Real-time log viewer with auto-scroll
- Progress tracking via stdout parsing
- Cancellation mechanism via process signals
- Module categorization and metadata

**Key Design Patterns:**
```typescript
// Module Registry Entry
{
  "id": "domain-discovery",
  "name": "Domain Discovery",
  "category": "Infrastructure",
  "scriptPath": "Modules/Discovery/Get-DomainInfo.psm1",
  "parameters": [...],
  "estimatedDuration": "2-5 minutes"
}

// Execution Flow
1. User selects module from grid
2. DiscoveryView displays parameter form
3. User clicks "Start Discovery"
4. IPC call to powerShellService.executeModule()
5. Real-time stdout streamed via IPC events
6. DiscoveryExecutionPanel displays logs
7. Progress bar updated from parsed output
8. Results stored in profile directory
```

**Files to Create:**
- `guiv2/src/main/config/ModuleRegistry.json`
- `guiv2/src/renderer/views/discovery/DiscoveryView.tsx`
- `guiv2/src/renderer/components/organisms/DiscoveryExecutionPanel.tsx`
- `guiv2/src/renderer/hooks/useDiscoveryLogic.ts`

**Implementation Estimate:** 12-16 hours

#### Epic 4: Logic Engine Service 📋
**Status:** Architecture Complete (0% implementation)
**Document:** `Epic4_Logic_Engine_Architecture.md` (1,500+ lines)
**Location:** `D:\Scripts\UserMandA\GUI\Documentation\Epic4_Logic_Engine_Architecture.md`

**Architecture Highlights:**
- Two-tier caching (Hot cache + LRU, 15-min TTL)
- 30+ data indices for O(1) lookups
- 9 inference rules for data correlation
- Levenshtein fuzzy matching (threshold 0.7)
- CSV streaming loaders (memory-efficient)
- Projection builders for detail views

**Key Design Patterns:**
```typescript
// Data Indices (30+ total)
class LogicEngineService {
  private usersBySID: Map<string, UserRecord>;
  private usersByUPN: Map<string, UserRecord>;
  private computersByName: Map<string, ComputerRecord>;
  private groupsBySID: Map<string, GroupRecord>;
  // ... 26 more indices

  // Inference Rules
  private applyAclGroupUserInference(): void;
  private applyPrimaryDeviceInference(): void;
  private applyGPOAssignmentInference(): void;
  // ... 6 more rules

  // Projection Builders
  public buildUserDetailProjection(userId: string): UserDetailProjection;
  public buildComputerDetailProjection(computerId: string): ComputerDetailProjection;
  public buildGroupDetailProjection(groupId: string): GroupDetailProjection;
}
```

**Performance Targets:**
- Load 10,000 users: <5 seconds
- Build user detail projection (cached): <100ms
- Build user detail projection (uncached): <500ms
- Memory footprint: <500MB for 10K users

**Inference Rules:**
1. ACL → Group → User (file permissions through group memberships)
2. Primary Device (login frequency analysis)
3. GPO Assignment (via OU membership)
4. Mailbox Correlation (UPN matching)
5. Application Usage (installed apps → user profiles)
6. Azure Role Inference (Entra ID → on-prem)
7. SQL Risk Assessment (elevated permissions)
8. Nested Group Resolution (recursive flattening)
9. Device Ownership (usage pattern analysis)

**Files to Create:**
- `guiv2/src/main/services/logicEngineService.ts` (1,500+ lines)

**Files to Modify:**
- `guiv2/src/main/ipcHandlers.ts` (replace mock data)
- `guiv2/src/main/main.ts` (initialize on startup)

**Implementation Estimate:** 28-36 hours

#### Epic 5: Dialogs and User Interactions ⏳
**Status:** 30% Complete (Modal system exists, dialogs needed)
**Document:** Covered in Implementation Handoff Guide
**Key Achievements:**
- Modal system (useModalStore) exists
- Some dialogs already created (CreateProfileDialog, ConfirmDialog)

**Remaining Work:**
- WaveSchedulingDialog (date/time picker)
- BulkEditDialog (multi-item editing)
- DependencyWarningDialog (conflict resolution)
- ExportOptionsDialog (format selection)
- Keyboard shortcuts (useKeyboardShortcuts hook)
- Command palette (fuzzy search commands)

**Reference Files:**
- `guiv2/src/renderer/store/useModalStore.ts`
- `guiv2/src/renderer/components/dialogs/` (various dialogs)

### Infrastructure Documentation

#### Session Summaries
- **Session Complete Summary:** `SESSION_COMPLETE_SUMMARY.md`
- **Current Session Summary:** `Session_2025-10-05_Epic_Implementation_Summary.md` (THIS SESSION)

#### Project Planning
- **CLAUDE.md:** Main project specification and implementation guide
- **CLAUDE.local.md:** Local user instructions (detailed phase-by-phase plan)
- **Epic Completion Checklist:** `Epic_Completion_Checklist.md` (THIS SESSION)
- **Implementation Handoff Guide:** `Implementation_Handoff_Guide.md` (THIS SESSION)

#### Gap Analysis
- **Comprehensive Gap Analysis:** `COMPREHENSIVE_GAP_ANALYSIS.md`
- **Architecture Analysis:** `ARCHITECTURE_ANALYSIS_COMPLETE.md`
- **Finished Tasks:** `FINISHED.md`

---

## Component Architecture

### Atomic Design Hierarchy

```
Atoms (Basic UI Primitives)
├── Button.tsx                  # Primary/secondary/danger variants
├── Input.tsx                   # Text input with validation
├── Select.tsx                  # Dropdown selector
├── Checkbox.tsx                # Checkbox input
├── StatusIndicator.tsx         # Colored dot + label (success/warning/error)
└── Badge.tsx                   # Label badge

Molecules (Composed UI Elements)
├── SearchBar.tsx               # Input + search icon + clear button
├── ProfileSelector.tsx         # Dropdown + test connection + create/delete
├── LoadingOverlay.tsx          # Full-screen overlay + spinner + message
├── Pagination.tsx              # Page controls + size selector
└── ColumnVisibilityToggle.tsx  # Button + modal with checkboxes

Organisms (Complex Components)
├── DataTable.tsx               # TanStack Table + sorting + filtering + export
├── Sidebar.tsx                 # Navigation menu + profile section + theme toggle
├── TabView.tsx                 # Tab headers + dynamic content rendering
├── BreadcrumbNavigation.tsx    # Breadcrumb trail + navigation
├── DiscoveryExecutionPanel.tsx # Real-time log viewer + progress bar
└── CommandPalette.tsx          # Fuzzy search + keyboard nav

Dialogs (Modal Components)
├── CreateProfileDialog.tsx     # Profile creation form
├── ConfirmDialog.tsx           # Generic yes/no confirmation
├── WaveSchedulingDialog.tsx    # Date/time picker for migration waves
├── BulkEditDialog.tsx          # Multi-item editing form
├── DependencyWarningDialog.tsx # Migration conflict resolution
└── ExportOptionsDialog.tsx     # Export format/column selection

Views (Top-Level Pages)
├── UsersView.tsx               # User list with DataTable
├── UserDetailView.tsx          # 9-tab drill-down (Overview, Devices, Apps, etc.)
├── ComputersView.tsx           # Computer list with DataTable
├── ComputerDetailView.tsx      # 6-tab drill-down
├── GroupsView.tsx              # Group list with DataTable
├── GroupDetailView.tsx         # 6-tab drill-down
├── MigrationPlanningView.tsx   # Wave management + drag-and-drop
├── DiscoveryView.tsx           # Module grid + execution panel
└── ... (75+ more views to integrate)
```

### Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│  - DndProvider (drag-and-drop context)                      │
│  - Router (navigation)                                       │
│  - useKeyboardShortcuts() (global shortcuts)                │
│  - Modal container (from useModalStore)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                  │
┌───────▼────────┐              ┌─────────▼──────────┐
│  Sidebar.tsx   │              │  View (e.g.,       │
│  - Navigation  │              │  UsersView.tsx)    │
│  - Profile     │              │  - DataTable       │
│  - Theme       │              │  - Context Menu    │
└────────────────┘              │  - Drag Source     │
                                └─────────┬──────────┘
                                          │
                              ┌───────────┴───────────┐
                              │                       │
                    ┌─────────▼──────────┐  ┌────────▼─────────┐
                    │  Detail View       │  │  Dialogs         │
                    │  (9-tab drill-down)│  │  (useModalStore) │
                    │  - IPC call        │  │  - Forms         │
                    │  - Real data       │  │  - Actions       │
                    └────────────────────┘  └──────────────────┘
```

---

## Data Flow Architecture

### IPC Communication Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                    Renderer Process (React)                      │
├─────────────────────────────────────────────────────────────────┤
│  View Component (e.g., UserDetailView.tsx)                      │
│    ↓                                                             │
│  Custom Hook (e.g., useUserDetailLogic.ts)                      │
│    ↓                                                             │
│  IPC Call: window.electron.invoke('get-user-detail', userId)    │
└──────────────────────────────┬──────────────────────────────────┘
                               │ (IPC Bridge)
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Preload.ts (Secure Bridge)                  │
│  contextBridge.exposeInMainWorld('electron', {                  │
│    invoke: (channel, data) => ipcRenderer.invoke(channel, data) │
│  })                                                              │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Main Process (Node.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  IPC Handler (ipcHandlers.ts)                                   │
│    ipcMain.handle('get-user-detail', async (_, { userId }) => { │
│      const projection = await logicEngineService               │
│                              .buildUserDetailProjection(userId); │
│      return projection;                                         │
│    });                                                           │
│    ↓                                                             │
│  Service Layer (logicEngineService.ts)                          │
│    - Load CSV data                                              │
│    - Apply inference rules                                      │
│    - Build projection                                           │
│    - Return JSON                                                │
└─────────────────────────────────────────────────────────────────┘
```

### State Management Flow (Zustand)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Component (React)                             │
│  const { users, setUsers } = useDiscoveryStore();               │
│                                                                  │
│  useEffect(() => {                                              │
│    fetchUsers().then(setUsers);  // Update store                │
│  }, []);                                                         │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Zustand Store (useDiscoveryStore.ts)          │
│  interface DiscoveryState {                                     │
│    users: UserData[];                                           │
│    computers: ComputerData[];                                   │
│    groups: GroupData[];                                         │
│    setUsers: (users: UserData[]) => void;                       │
│  }                                                               │
│                                                                  │
│  export const useDiscoveryStore = create<DiscoveryState>(       │
│    (set) => ({                                                  │
│      users: [],                                                 │
│      setUsers: (users) => set({ users }),                       │
│    })                                                            │
│  );                                                              │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ↓
         All components subscribed to store re-render
```

### PowerShell Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. User Action (e.g., "Refresh Users")                         │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. IPC Call: invoke('run-powershell', { scriptName: 'Get-     │
│     AllUsers.psm1', args: [...] })                              │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. powerShellService.ts                                        │
│     - Check cache (5-min TTL)                                   │
│     - If stale: spawn('pwsh', [scriptPath, ...args])            │
│     - Listen to stdout/stderr                                   │
│     - Send IPC events: 'powershell-output'                      │
│     - Parse JSON output                                         │
│     - Cache result                                              │
│     - Return data                                               │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. PowerShell Module Execution (Get-AllUsers.psm1)             │
│     - Query Active Directory                                    │
│     - Process data                                              │
│     - Write-Output (ConvertTo-Json)                             │
│     - Save CSV to C:\discoverydata\{Profile}\Raw\users.csv      │
└──────────────────────────────┬──────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. Fallback Strategy (on PowerShell failure)                   │
│     - Try reading last known good CSV                           │
│     - Parse CSV data                                            │
│     - Return stale data + warning                               │
│     - If CSV missing: return mock data + error toast            │
└─────────────────────────────────────────────────────────────────┘
```

---

## IPC Handler Registry

### Discovery Data Handlers
```typescript
// guiv2/src/main/ipcHandlers.ts

'get-users'               → powerShellService.execute('Get-AllUsers.psm1')
'get-computers'           → powerShellService.execute('Get-AllComputers.psm1')
'get-groups'              → powerShellService.execute('Get-AllGroups.psm1')
'get-user-detail'         → logicEngineService.buildUserDetailProjection(userId)
'get-computer-detail'     → logicEngineService.buildComputerDetailProjection(computerId)
'get-group-detail'        → logicEngineService.buildGroupDetailProjection(groupId)
'run-powershell'          → powerShellService.execute(scriptName, args)
'cancel-powershell'       → powerShellService.cancel(processId)
```

### Migration Planning Handlers
```typescript
// guiv2/src/main/ipcHandlers.migration.ts

'migration:get-waves'         → databaseService.getWaves()
'migration:add-wave'          → databaseService.addWave(wave)
'migration:delete-wave'       → databaseService.deleteWave(waveId)
'migration:update-wave'       → databaseService.updateWave(waveId, updates)
'migration:add-item-to-wave'  → databaseService.addItemToWave(waveId, item)
'migration:remove-item'       → databaseService.removeItemFromWave(waveId, itemId)
'migration:move-item'         → databaseService.moveItemBetweenWaves(fromWaveId, toWaveId, itemId)
'migration:update-schedule'   → databaseService.updateWaveSchedule(waveId, schedule)
'migration:reorder-waves'     → databaseService.reorderWaves(waveIds)
'migration:validate-wave'     → databaseService.validateWave(waveId)
'migration:export-plan'       → databaseService.exportPlan(format)
'migration:import-plan'       → databaseService.importPlan(filePath)
```

### Profile Management Handlers
```typescript
'get-profiles'            → configService.getProfiles()
'create-profile'          → configService.createProfile(profile)
'delete-profile'          → configService.deleteProfile(profileId)
'test-connection'         → powerShellService.execute('Test-Connection.psm1', profile)
'set-selected-profile'    → configService.setSelectedProfile(profileId)
```

### Configuration Handlers
```typescript
'get-settings'            → configService.getSettings()
'update-settings'         → configService.updateSettings(settings)
'get-theme'               → configService.getTheme()
'set-theme'               → configService.setTheme(theme)
```

### IPC Events (Main → Renderer)
```typescript
'powershell-output'       → Emitted during PowerShell execution (real-time logs)
'powershell-progress'     → Emitted with progress percentage
'powershell-complete'     → Emitted when PowerShell finishes
'powershell-error'        → Emitted on PowerShell errors
```

---

## Type Definition Locations

### Core Data Types
```typescript
// guiv2/src/renderer/types/models.ts
interface UserData {
  sid: string;
  displayName: string;
  email: string;
  department: string;
  enabled: boolean;
  lastLogon: string;
  // ... 20+ more fields
}

interface ComputerData {
  name: string;
  sid: string;
  operatingSystem: string;
  lastLogon: string;
  enabled: boolean;
  // ... 15+ more fields
}

interface GroupData {
  sid: string;
  name: string;
  type: 'Security' | 'Distribution';
  scope: 'DomainLocal' | 'Global' | 'Universal';
  memberCount: number;
  // ... 10+ more fields
}
```

### Detail View Types
```typescript
// guiv2/src/renderer/types/userDetail.ts
interface UserDetailProjection {
  overview: UserOverviewTab;
  devices: UserDevicesTab;
  applications: UserApplicationsTab;
  groups: UserGroupsTab;
  groupPolicy: UserGPOTab;
  fileAccess: UserFileAccessTab;
  mailbox: UserMailboxTab;
  azureRoles: UserAzureRolesTab;
  sqlRisks: UserSQLRisksTab;
}

// 9 tab-specific interfaces
// ... (200+ lines total)

// guiv2/src/renderer/types/computerDetail.ts
interface ComputerDetailProjection {
  overview: ComputerOverviewTab;
  users: ComputerUsersTab;
  software: ComputerSoftwareTab;
  hardware: ComputerHardwareTab;
  security: ComputerSecurityTab;
  network: ComputerNetworkTab;
}

// 6 tab-specific interfaces
// ... (150+ lines total)

// guiv2/src/renderer/types/groupDetail.ts
interface GroupDetailProjection {
  overview: GroupOverviewTab;
  members: GroupMembersTab;
  owners: GroupOwnersTab;
  permissions: GroupPermissionsTab;
  applications: GroupApplicationsTab;
  nestedGroups: GroupNestedGroupsTab;
}

// 6 tab-specific interfaces
// ... (150+ lines total)
```

### Migration Types
```typescript
// guiv2/src/renderer/types/migration.ts
interface MigrationWave {
  id: string;
  name: string;
  description?: string;
  schedule: WaveSchedule | null;
  items: MigrationItem[];
  order: number;
  status: 'Planning' | 'Scheduled' | 'InProgress' | 'Completed' | 'Failed';
}

interface MigrationItem {
  id: string;
  type: 'USER' | 'COMPUTER' | 'GROUP';
  name: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Failed';
  error?: string;
}

interface WaveSchedule {
  scheduledDate: string;
  timezone?: string;
  maintenanceWindow?: {
    start: string;
    end: string;
  };
}

interface DependencyRule {
  id: string;
  type: 'requires' | 'blocks';
  sourceId: string;
  targetId: string;
  description: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

### Store Types
```typescript
// guiv2/src/renderer/store/useDiscoveryStore.ts
interface DiscoveryState {
  users: UserData[];
  computers: ComputerData[];
  groups: GroupData[];
  isLoading: boolean;
  error: string | null;
  setUsers: (users: UserData[]) => void;
  setComputers: (computers: ComputerData[]) => void;
  setGroups: (groups: GroupData[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// guiv2/src/renderer/store/useProfileStore.ts
interface ProfileState {
  profiles: Profile[];
  selectedProfile: Profile | null;
  connectionStatus: 'connected' | 'disconnected' | 'testing';
  loadProfiles: () => Promise<void>;
  setSelectedProfile: (profile: Profile) => void;
  createProfile: (profile: Omit<Profile, 'id'>) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  testConnection: (profile: Profile) => Promise<boolean>;
}

// guiv2/src/renderer/store/useTabStore.ts
interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (tab: Omit<Tab, 'id'>) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
}

// guiv2/src/renderer/store/useModalStore.ts
interface ModalState {
  isOpen: boolean;
  Component: React.ElementType | null;
  props: Record<string, any>;
  openModal: (Component: React.ElementType, props?: Record<string, any>) => void;
  closeModal: () => void;
}
```

---

## Service Layer Architecture

### Main Process Services

#### PowerShell Service
```typescript
// guiv2/src/main/services/powerShellService.ts
class PowerShellService {
  private cache: Map<string, CacheEntry>;
  private runningProcesses: Map<string, ChildProcess>;

  execute(scriptName: string, args: string[]): Promise<any>;
  cancel(processId: string): void;
  private checkCache(key: string): CacheEntry | null;
  private updateCache(key: string, data: any): void;
  private resolveScriptPath(scriptName: string): string;
  private parseOutput(stdout: string): any;
  private handleError(stderr: string): never;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // 5 minutes default
}
```

**Key Features:**
- 5-minute TTL cache
- Streaming stdout/stderr via IPC events
- Cancellation support
- Automatic fallback to CSV files
- JSON parsing with error handling

#### Database Service (lowdb)
```typescript
// guiv2/src/main/services/databaseService.ts
class DatabaseService {
  private db: Low<DatabaseSchema>;
  private profilePath: string;

  initializeDatabase(profileName: string): Promise<void>;
  getWaves(): Promise<MigrationWave[]>;
  addWave(wave: Omit<MigrationWave, 'id'>): Promise<MigrationWave>;
  deleteWave(waveId: string): Promise<void>;
  updateWave(waveId: string, updates: Partial<MigrationWave>): Promise<void>;
  addItemToWave(waveId: string, item: MigrationItem): Promise<void>;
  removeItemFromWave(waveId: string, itemId: string): Promise<void>;
  moveItemBetweenWaves(fromWaveId: string, toWaveId: string, itemId: string): Promise<void>;
  updateWaveSchedule(waveId: string, schedule: WaveSchedule): Promise<void>;
  reorderWaves(waveIds: string[]): Promise<void>;
  validateWave(waveId: string): Promise<ValidationResult>;
  exportPlan(format: 'json' | 'csv'): Promise<string>;
  importPlan(filePath: string): Promise<void>;
  private createBackup(): Promise<void>;
  restoreFromBackup(backupName: string): Promise<void>;
}

interface DatabaseSchema {
  version: string;
  waves: MigrationWave[];
  metadata: {
    createdAt: string;
    lastModified: string;
  };
}
```

**Key Features:**
- Profile-specific storage: `C:\discoverydata\{Profile}\migration-plan.json`
- Auto-backup before destructive operations
- Backup rotation (keep last 10)
- Schema versioning
- Full CRUD operations

#### Logic Engine Service (Epic 4)
```typescript
// guiv2/src/main/services/logicEngineService.ts
class LogicEngineService {
  // Data Indices (30+ total)
  private usersBySID: Map<string, UserRecord>;
  private usersByUPN: Map<string, UserRecord>;
  private computersByName: Map<string, ComputerRecord>;
  private groupsBySID: Map<string, GroupRecord>;
  private filesBySID: Map<string, FileRecord[]>;
  private aclsByPath: Map<string, AclRecord[]>;
  // ... 24 more indices

  // Cache (two-tier)
  private hotCache: Map<string, CachedProjection>;
  private lruCache: LRUCache<string, CachedProjection>;

  // Public API
  initializeForProfile(profilePath: string): Promise<void>;
  buildUserDetailProjection(userId: string): Promise<UserDetailProjection>;
  buildComputerDetailProjection(computerId: string): Promise<ComputerDetailProjection>;
  buildGroupDetailProjection(groupId: string): Promise<GroupDetailProjection>;
  clearCache(): void;

  // CSV Loaders
  private loadUsers(csvPath: string): Promise<void>;
  private loadComputers(csvPath: string): Promise<void>;
  private loadGroups(csvPath: string): Promise<void>;
  // ... 7 more loaders

  // Inference Rules
  private applyAclGroupUserInference(): void;
  private applyPrimaryDeviceInference(): void;
  private applyGPOAssignmentInference(): void;
  private applyMailboxCorrelationInference(): void;
  private applyApplicationUsageInference(): void;
  private applyAzureRoleInference(): void;
  private applySQLRiskAssessment(): void;
  private applyNestedGroupResolution(): void;
  private applyDeviceOwnershipInference(): void;

  // Fuzzy Matching
  private calculateLevenshteinDistance(a: string, b: string): number;
  private fuzzyMatch(source: string, target: string, threshold: number): boolean;
}
```

**Key Features:**
- 30+ indices for O(1) lookups
- 9 inference rules for data correlation
- Two-tier caching (hot + LRU, 15-min TTL)
- CSV streaming (memory-efficient)
- Fuzzy matching (Levenshtein, threshold 0.7)
- Performance targets: <5s load, <100ms cached projections

---

## Store (State Management) Architecture

### Zustand Stores

```typescript
// Store Structure
guiv2/src/renderer/store/
├── useDiscoveryStore.ts      # Users, computers, groups data
├── useProfileStore.ts        # Profile management
├── useTabStore.ts            # Tab navigation
├── useModalStore.ts          # Modal/dialog state
├── useUIStateStore.ts        # Loading overlays, toasts
├── useThemeStore.ts          # Dark/light mode
└── useMigrationStore.ts      # Migration planning (optional)
```

**Store Design Pattern:**
```typescript
import { create } from 'zustand';

interface StoreState {
  // State
  data: SomeType[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadData: () => Promise<void>;
  updateData: (newData: SomeType[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  data: [],
  isLoading: false,
  error: null,

  // Actions
  loadData: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await window.electron.invoke('some-handler');
      set({ data: result, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  updateData: (newData) => set({ data: newData }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
```

**Usage in Components:**
```typescript
const MyComponent: React.FC = () => {
  const { data, isLoading, loadData } = useStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) return <LoadingOverlay />;

  return <div>{/* render data */}</div>;
};
```

---

## Routing Architecture

```typescript
// guiv2/src/renderer/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

<Router>
  <Routes>
    {/* Main Views */}
    <Route path="/" element={<DashboardView />} />
    <Route path="/users" element={<UsersView />} />
    <Route path="/computers" element={<ComputersView />} />
    <Route path="/groups" element={<GroupsView />} />

    {/* Detail Views */}
    <Route path="/users/:userId" element={<UserDetailView />} />
    <Route path="/computers/:computerId" element={<ComputerDetailView />} />
    <Route path="/groups/:groupId" element={<GroupDetailView />} />

    {/* Migration */}
    <Route path="/migration/planning" element={<MigrationPlanningView />} />
    <Route path="/migration/execution" element={<MigrationExecutionView />} />

    {/* Discovery */}
    <Route path="/discovery" element={<DiscoveryView />} />
    <Route path="/discovery/:moduleId" element={<DiscoveryExecutionView />} />

    {/* Settings */}
    <Route path="/settings" element={<SettingsView />} />
    <Route path="/profiles" element={<ProfileManagementView />} />

    {/* Analytics */}
    <Route path="/analytics/executive" element={<ExecutiveDashboardView />} />
    <Route path="/analytics/users" element={<UserAnalyticsView />} />
    {/* ... 75+ more routes */}
  </Routes>
</Router>
```

**Navigation Pattern:**
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigate to detail view
navigate(`/users/${user.sid}`);

// Navigate with state
navigate('/migration/planning', { state: { wave: selectedWave } });

// Programmatic navigation from context menu
const handleViewDetails = (user: UserData) => {
  navigate(`/users/${user.sid}`);
};
```

---

## PowerShell Integration

### Module Structure
```
D:\Scripts\UserMandA\
├── Modules/
│   ├── Discovery/
│   │   ├── Get-AllUsers.psm1
│   │   ├── Get-AllComputers.psm1
│   │   ├── Get-AllGroups.psm1
│   │   ├── Get-DomainInfo.psm1
│   │   └── ... (30+ modules)
│   ├── Analytics/
│   │   ├── Get-ExecutiveMetrics.psm1
│   │   ├── Get-UserAnalytics.psm1
│   │   └── ...
│   ├── Migration/
│   │   ├── Start-Migration.psm1
│   │   ├── Test-MigrationReadiness.psm1
│   │   └── ...
│   └── Security/
│       ├── Get-SecurityMetrics.psm1
│       └── ...
└── Core/
    ├── Test-Connection.psm1
    └── ...
```

### Module Output Format
**All modules must output JSON:**
```powershell
# Get-AllUsers.psm1
function Get-AllUsers {
    param(
        [string]$Domain,
        [bool]$IncludeDisabled = $false
    )

    $users = Get-ADUser -Filter * -Properties *

    $result = $users | Select-Object @{
        Name = 'sid'; Expression = { $_.SID.Value }
    }, @{
        Name = 'displayName'; Expression = { $_.DisplayName }
    }, @{
        Name = 'email'; Expression = { $_.EmailAddress }
    }
    # ... more fields

    # Save to CSV
    $result | Export-Csv -Path "C:\discoverydata\$Domain\Raw\users.csv" -NoTypeInformation

    # Output JSON for IPC
    $result | ConvertTo-Json -Depth 10
}
```

### PowerShell Execution Flow
```
1. GUI calls IPC: invoke('run-powershell', { scriptName, args })
2. powerShellService.execute() spawns: pwsh -NoProfile -ExecutionPolicy Bypass -File {scriptPath} {args}
3. PowerShell module executes, outputs JSON to stdout
4. powerShellService parses JSON
5. powerShellService caches result (5-min TTL)
6. powerShellService saves CSV to C:\discoverydata\{Profile}\Raw\
7. powerShellService returns data to renderer
```

---

## Build & Deployment

### Build Scripts
```json
// package.json
{
  "scripts": {
    "start": "electron-forge start",           // Development mode
    "package": "electron-forge package",       // Production build
    "make": "electron-forge make",             // Create distributables
    "lint": "eslint src --ext .ts,.tsx",       // TypeScript linting
    "typecheck": "tsc --noEmit"                // Type checking
  }
}
```

### Build Process
```
1. TypeScript compilation (src → dist)
2. Webpack bundling (renderer + main processes)
3. Electron packaging (Electron Forge)
4. Output: out/make/squirrel.windows/x64/
```

### Deployment Strategy
```
guiv2/ (development)
  ↓ (build via build-gui.ps1)
C:\enterprisediscovery\ (production)
  ├── guiv2.exe
  ├── resources/
  │   └── app.asar (bundled app)
  └── Modules/ (copied from D:\Scripts\UserMandA\Modules)
```

**Build Script:** `D:\Scripts\UserMandA\build-gui.ps1`
- Compiles TypeScript
- Bundles with Webpack
- Packages with Electron Forge
- Copies to `C:\enterprisediscovery\`
- Copies PowerShell modules

---

## Quick Reference

### Key Files by Function

**Entry Points:**
- Main process: `guiv2/src/main/main.ts`
- Renderer process: `guiv2/src/renderer/App.tsx`
- IPC bridge: `guiv2/src/preload.ts`

**Core Services:**
- PowerShell: `guiv2/src/main/services/powerShellService.ts`
- Database: `guiv2/src/main/services/databaseService.ts`
- Logic Engine: `guiv2/src/main/services/logicEngineService.ts` (Epic 4)

**IPC Handlers:**
- Discovery: `guiv2/src/main/ipcHandlers.ts`
- Migration: `guiv2/src/main/ipcHandlers.migration.ts`

**Reusable Components:**
- DataTable: `guiv2/src/renderer/components/organisms/DataTable.tsx`
- StatusIndicator: `guiv2/src/renderer/components/molecules/StatusIndicator.tsx`
- LoadingOverlay: `guiv2/src/renderer/components/molecules/LoadingOverlay.tsx`

**Example Views:**
- Users (list): `guiv2/src/renderer/views/UsersView.tsx`
- User (detail): `guiv2/src/renderer/views/users/UserDetailView.tsx`
- Computer (detail): `guiv2/src/renderer/views/computers/ComputerDetailView.tsx`
- Group (detail): `guiv2/src/renderer/views/groups/GroupDetailView.tsx`

**Type Definitions:**
- Core models: `guiv2/src/renderer/types/models.ts`
- User details: `guiv2/src/renderer/types/userDetail.ts`
- Migration: `guiv2/src/renderer/types/migration.ts`

**Stores:**
- Discovery data: `guiv2/src/renderer/store/useDiscoveryStore.ts`
- Profiles: `guiv2/src/renderer/store/useProfileStore.ts`
- Tabs: `guiv2/src/renderer/store/useTabStore.ts`
- Modals: `guiv2/src/renderer/store/useModalStore.ts`

### Common Patterns

**IPC Call:**
```typescript
const result = await window.electron.invoke('handler-name', { param1, param2 });
```

**Zustand Store Usage:**
```typescript
const { data, loadData } = useStore();
useEffect(() => { loadData(); }, []);
```

**Navigation:**
```typescript
const navigate = useNavigate();
navigate('/users/123');
```

**Open Modal:**
```typescript
const { openModal } = useModalStore();
openModal(DialogComponent, { prop1, prop2 });
```

**Context Menu:**
```typescript
import { Menu, Item, useContextMenu } from 'react-contexify';
const { show } = useContextMenu({ id: 'menu-id' });
// Right-click handler: show({ event, props: { data } });
```

---

## Document Maintenance

**Last Updated:** October 5, 2025
**Version:** 1.0
**Next Review:** After Epic 2 UI completion

**Update Triggers:**
- New Epic completed
- Major architecture changes
- New service added
- New IPC handlers added
- New views integrated

**Maintainer:** Documentation & QA Guardian Agent

---

**End of Architecture Index**
