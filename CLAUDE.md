Project Mandate: Full rewrite of /GUI (C#/WPF) to /guiv2 (TypeScript/React/Electron) with 100% feature parity in functionality, UI/UX, and interaction design.

Last Updated: October 4, 2025

📋 PROJECT OVERVIEW
This document provides a complete, sequential implementation guide for building the guiv2 application. The goal is to achieve 100% feature parity with the original WPF-based GUI through systematic implementation.

✅ CURRENT PROJECT STATUS
Infrastructure Completion: 100% ✅ (15/15 tasks complete)

Completed Infrastructure Tasks:

Real Data Integration Infrastructure ✅

Global State Management System ✅

Profile Management UI ✅

Connection Testing (T-000) ✅

Pagination System ✅

Export Functionality ✅

Theme Management ✅

Module Registry ✅

Migration Execution ✅

Audit and Security ✅

Real-time Monitoring ✅

Performance Optimizations ✅

Error Handling ✅

Accessibility ✅

Tab Navigation ✅

View Integration Status: 35% ⏳ (Discovery views complete, 75+ remaining views need PowerShell integration)

🏗️ ARCHITECTURAL MAPPING
Original WPF/C# Concept

New Electron/React/TS Equivalent

MandADiscoverySuite.xaml / MainWindow.xaml

src/renderer/components/layouts/MainLayout.tsx

Views (.xaml files in /Views)

React Components (.tsx files in src/renderer/views)

ViewModels (.cs files in /ViewModels)

Zustand Stores (.ts in src/renderer/store) + React Hooks (.ts in src/renderer/hooks)

LogicEngineService.cs

Backend logic in Electron Main Process (src/main/services/logicEngineService.ts)

PowerShellExecutionService.cs

src/main/services/powerShellService.ts + IPC handlers in src/main/ipcHandlers.ts

Dialogs (.xaml files in /Dialogs)

Modal components managed by useModalStore.ts.

Data Models (.cs files in /Models)

TypeScript types (src/renderer/types/models).

Resource Dictionaries (.xaml in /Resources, /Themes)

Tailwind CSS configuration (tailwind.config.js) and global CSS (src/index.css).

🎯 IMPLEMENTATION STRATEGY
🔍 REFERENCE OLD /GUI/ CODE FOR INSPIRATION: When implementing new views in TypeScript/React/Electron, systematically reference the corresponding files in /GUI/Views/ to understand what the old code did. Use this as inspiration for what the new code should accomplish in the new language context.

Key Implementation Principles:
Examine Original Functionality: First read the corresponding .xaml.cs file in /GUI/Views/ to understand the original C# implementation.

Example: When implementing ExecutiveDashboardView.tsx, first read /GUI/Views/DashboardView.xaml.cs to understand what KPIs, charts, and data it displayed.

Translate Logic: Convert C# ViewModels and business logic to TypeScript hooks and PowerShell module calls.

Maintain Feature Parity: Ensure all original functionality is preserved, including context menus, tooltips, and dialogs.

Working Patterns: Use established patterns from UsersView, GroupsView, and discovery views.

Reference Implementation Pattern (UsersView):
// Data Loading Flow in Custom Hooks:
1. Check cache first (5-minute TTL managed by PowerShellService in the main process).
2. If cache is stale/miss, try live PowerShell module execution (e.g., Get-AllUsers.psm1).
3. On failure, fallback to reading the last known good CSV from the profile's 'Raw' directory.
4. As an ultimate fallback, return mock data and display a prominent warning toast to the user.

// Key Implementation (in a custom hook like `useUsersViewLogic.ts`):
const { users, isLoading, error, setUsers } = useDiscoveryStore();
const { selectedProfile } = useProfileStore();

useEffect(() => {
  const fetchUsers = async () => {
    if (!selectedProfile) return;
    // Set loading state in store
    const result = await window.electron.invoke('get-users', { profile: selectedProfile.companyName });
    // Update Zustand store with the result and handle errors
    setUsers(result.data);
  };
  fetchUsers();
}, [selectedProfile, setUsers]);

🚀 DETAILED IMPLEMENTATION PLAN
Epic 0: UI/UX Parity and Foundation
User Story: As a user, I want the new application to look, feel, and behave exactly like the old one, with the same colors, layout, and interactive elements.

Task 0.1: Translate WPF Styles to Tailwind CSS
File: tailwind.config.js

Action: Replicate the color palette and styling definitions.

Technical Details:

Analyze /GUI/Themes/Colors.xaml, /GUI/Themes/LightTheme.xaml, and DarkTheme.xaml.

In tailwind.config.js, under theme.extend.colors, define all custom colors (e.g., accent, primary-text, card-background, status-success, status-warning, status-error).

Translate common styles from /GUI/Resources/Styles/MainStyles.xaml (e.g., ModernCardStyle) into a base component or a @apply directive in src/index.css.

Task 0.2: Port Common Controls
Action: Create React equivalents for common WPF controls found in /GUI/Controls/.

Files to Create:

src/renderer/components/molecules/StatusIndicator.tsx: A component that accepts a status prop ('Success', 'Warning', 'Error') and displays a colored dot and text, replicating /GUI/Controls/StatusIndicator.xaml.

src/renderer/components/molecules/LoadingOverlay.tsx: A full-screen overlay with a spinner and a message, controlled via a global Zustand store (useUIStateStore), replicating /GUI/Controls/LoadingOverlay.xaml.

src/renderer/components/organisms/Breadcrumb.tsx: A navigation component that displays the current view path, based on /GUI/Controls/BreadcrumbNavigation.xaml.

Epic 1: Implement Core Data Views & Functionality
User Story: As a migration consultant, I want to view the discovered data for users, computers, and groups with full interactivity.

Task 1.1: Create a Reusable Data Table Component
File: src/renderer/components/organisms/DataTable.tsx

Action: Enhance DataTable.tsx to match the WPF DataGrid functionality.

Technical Details:

Library: Use TanStack Table (v8) for the core logic.

Features: Implement sorting, global filtering (search box), and pagination controls.

Column Visibility: Add a "Columns" button. On click, open a modal (useModalStore) with a list of checkboxes to toggle column visibility. State should be managed within the DataTable component. Reference /GUI/Dialogs/ColumnVisibilityDialog.xaml.

Context Menus: Use a library like react-contexify. On right-clicking a row, display a menu with actions ("View Details", "Copy Row", "Export Selection").

Row Selection: Implement a checkbox column for multi-row selection. The selection state should be managed by the table instance.

Task 1.2: Implement the Users View and Detail View
Action: Create the list view for all users and a detailed drill-down view for a single user.

useUsersViewLogic.ts:

Implement as originally planned, calling window.electron.invoke('get-users').

UsersView.tsx:

Use the DataTable component.

Implement the handler for the "View Details" context menu item. It should call tabsStore.openTab() to open a new UserDetailView tab, passing the user's ID.

File to Create: src/renderer/views/users/UserDetailView.tsx

This component will receive a userId prop.

It will have its own hook, useUserDetailLogic.ts, which calls window.electron.invoke('get-user-detail', userId).

The view should display all correlated user data (groups, devices, permissions, mailbox info) in a layout inspired by /GUI/Views/UserDetailWindow.xaml.

Task 1.3 & 1.4: Implement Computers and Groups Views
Action: Implement these views following the exact same pattern as UsersView, including creating detail views (ComputerDetailView.tsx, GroupDetailView.tsx) that are opened in new tabs.

Epic 2: Build Migration Planning Functionality
User Story: As a project manager, I want to organize users and systems into migration waves and track their status.

Task 2.1: Define Migration Data Models
File & Action: As specified.

Task 2.2: Create the Migration Planning View
Files & Action: As specified.

Drag-and-Drop Technical Details:

Library: Use react-dnd.

Make the rows in UsersView.tsx draggable. The drag source object should contain { id: user.sid, type: 'USER' }.

Make the wave list items in MigrationPlanningView.tsx a drop target that accepts the USER type.

The drop handler in useMigrationPlanningLogic.ts will receive the user's ID, find the target wave, and call the 'add-item-to-wave' IPC handler.

Task 2.3: Implement Backend for Migration Data
File: src/main/services/databaseService.ts

Action: Implement persistence logic.

Technical Details:

Library: Use lowdb to manage a JSON file named migration-plan.json inside the active profile's directory (e.g., C:\discoverydata\ProfileName\migration-plan.json).

IPC Handlers: Create granular IPC handlers in ipcHandlers.ts:

'get-migration-waves': Reads the JSON file.

'add-wave' (waveName): Adds a new wave object.

'delete-wave' (waveId): Removes a wave object.

'add-item-to-wave' (waveId, item): Adds an item to a specific wave.

Epic 3: Implement Discovery Module Execution
User Story: As a discovery analyst, I want to run discovery modules directly from the GUI and see their progress.

Task 3.1: Implement the PowerShell Execution Service
File: src/main/services/powerShellService.ts

Action & Implementation: As specified.

Technical Details:

Use Node.js's child_process.spawn.

Communication Flow:

Renderer calls window.electron.invoke('run-discovery-module', { moduleName, profile }).

ipcHandlers.ts receives the call and invokes powerShellService.executeModule().

powerShellService spawns a PowerShell process.

It listens to the process's stdout and stderr streams.

For each line of output, it sends an event to the renderer: mainWindow.webContents.send('powershell-output', { moduleName, line }).

The renderer-side hook (useDiscoveryLogic.ts) listens for this event and updates its state, causing the UI to re-render with the new log line.

Task 3.2: Create the Discovery View
Files & Action: As specified.

DiscoveryView.tsx UI Details:

Replicate the "card" layout from /GUI/Views/DiscoveryView.xaml.

Each card must display: Title, Description, Icon, Status Indicator, and a Progress Bar. This data comes from ModuleRegistry.json.

The Status and Progress should be updated in real-time based on IPC events from the main process.

Epic 4: Re-implement the Logic Engine
User Story: As a developer, I need to port the data correlation and processing logic from the C# LogicEngineService to TypeScript.

Task 4.1: Create the Logic Engine Service in TypeScript
File: src/main/services/logicEngineService.ts

Action: Re-implement the C# service.

Technical Details:

The service must have a main loadAllAsync(profilePath) method that orchestrates the loading of all CSVs.

Port Inference Logic: Translate the private "Inference Rules" methods from LogicEngineService.cs (ApplyAclGroupUserInference, ApplyPrimaryDeviceInference, etc.) into TypeScript equivalents. This is critical for data correlation.

Port Fuzzy Matching: Re-implement the Levenshtein distance logic from CalculateLevenshteinSimilarity and the fuzzy matching helpers (FuzzyMatchIdentityName).

Task 4.2: Expose Logic Engine via IPC
File: src/main/ipcHandlers.ts

Action: Wire up the logic engine to the renderer process.

get-user-detail Handler Details:

This handler will take a userId as an argument.

It will call the logicEngineService.buildUserDetailProjection(userId) method.

This method must construct and return a rich JSON object that matches the structure of the UserDetailProjection C# class, including all correlated data (groups, devices, permissions, mailbox info, etc.).

Epic 5: Port Dialogs and User Interactions
User Story: As a user, I need access to the same dialogs for creating profiles, managing settings, and confirming actions to have a consistent experience.

Task 5.1: Create a Generic Modal System
File: src/renderer/store/useModalStore.ts

Action: Implement a Zustand store to manage modal state.

Implementation:

// In useModalStore.ts
interface ModalState {
  isOpen: boolean;
  Component: React.ElementType | null;
  props: Record<string, any>;
  openModal: (Component: React.ElementType, props?: Record<string, any>) => void;
  closeModal: () => void;
}

In App.tsx, render a single, global modal container that conditionally renders the component from the store.

Task 5.2: Re-implement Key Dialogs
Action: Create React components for the most critical dialogs from /GUI/Dialogs/.

Files to Create:

src/renderer/components/dialogs/CreateProfileDialog.tsx: Replicate the form from CreateProfileDialog.xaml. On submit, call the 'create-profile' IPC handler.

src/renderer/components/dialogs/WaveSchedulingDialog.tsx: Implement a date/time picker to schedule migration waves, replicating WaveSchedulingDialog.xaml.

src/renderer/components/dialogs/ConfirmDialog.tsx: A generic confirmation modal with "Yes" and "No" buttons to replace MessageBox.Show.

📊 REMAINING VIEW INTEGRATION WORK
After completing the implementation epics above, integrate the remaining 75+ views with PowerShell modules.

View Categories Needing Integration:
Analytics & Reporting Views (8 views)
View

C# Reference

PowerShell Module

ExecutiveDashboardView

/GUI/Views/DashboardView.xaml.cs

Modules/Analytics/ExecutiveDashboard.psm1::Get-ExecutiveMetrics

MigrationReportView

/GUI/Views/MigrationReportView.xaml.cs

Modules/Reporting/MigrationReports.psm1::Get-MigrationReports

UserAnalyticsView

/GUI/Views/UserAnalyticsView.xaml.cs

Modules/Analytics/UserAnalytics.psm1::Get-UserAnalytics

And 5 more analytics views...

Reference /GUI/Views/

Various analytics modules

Asset & Infrastructure Views (15 views)
View

C# Reference

PowerShell Module

AssetInventoryView

/GUI/Views/AssetInventoryView.xaml.cs

Modules/Infrastructure/AssetInventory.psm1::Get-AssetInventory

ComputerInventoryView

/GUI/Views/ComputersView.xaml.cs

Modules/Infrastructure/ComputerInventory.psm1::Get-ComputerInventory

And 13 more infrastructure views...

Reference /GUI/Views/

Various infrastructure modules

Security & Compliance Views (12 views)
View

C# Reference

PowerShell Module

SecurityDashboardView

/GUI/Views/SecurityView.xaml.cs

Modules/Security/SecurityDashboard.psm1::Get-SecurityMetrics

ComplianceDashboardView

/GUI/Views/ComplianceDashboardView.xaml.cs

Modules/Compliance/ComplianceDashboard.psm1::Get-ComplianceStatus

And 10 more security views...

Reference /GUI/Views/

Various security modules

Administration Views (10 views)
View

C# Reference

PowerShell Module

UserManagementView

/GUI/Views/UserDetailWindow.xaml.cs

Modules/Administration/UserManagement.psm1::Get-UserManagementData

AuditLogView

/GUI/Views/AuditView.xaml.cs

Modules/Audit/AuditLogs.psm1::Get-AuditLogs

And 8 more admin views...

Reference /GUI/Views/

Various admin modules

Advanced Views (30+ views)
ScriptLibraryView, WorkflowAutomationView, CustomFieldsView, TagManagementView

BulkOperationsView, DataImportExportView, APIManagementView, WebhooksView

And 25+ more specialized views (all currently using mock data)

Implementation Priority:
Analytics Views (8 views) - ExecutiveDashboardView, MigrationReportView, etc.

Infrastructure/Asset Views (15 views) - AssetInventoryView, ComputerInventoryView, etc.

Security/Compliance Views (12 views) - SecurityDashboardView, ComplianceDashboardView, etc.

Administration Views (10 views) - UserManagementView, AuditLogView, etc.

Advanced Views (30+ views) - All remaining specialized views

📈 PROJECT METRICS & TIMELINE
Infrastructure Status: 100% ✅ Complete

Estimated Timeline:

Implementation Epics: 40-60 hours (4 epics × 10-15 hours each)

Analytics Views: 8-12 hours (8 views × 1-1.5 hours each)

Infrastructure Views: 15-20 hours (15 views × 1-1.5 hours each)

Security/Compliance Views: 12-18 hours (12 views × 1-1.5 hours each)

Administration Views: 10-15 hours (10 views × 1-1.5 hours each)

Advanced Views: 30-45 hours (30 views × 1-1.5 hours each)

Testing & QA: 10-15 hours

Total: 125-170 hours (5-7 weeks)

🎯 SUCCESS CRITERIA
Infrastructure: ✅ COMPLETE
✅ All services implemented and tested

✅ All stores created/enhanced

✅ All IPC handlers complete

✅ Error handling comprehensive

✅ Performance optimized

✅ Type safety 100%

Core Functionality: ⏳ READY FOR IMPLEMENTATION
⏳ Implementation Epics: 4 epics need completion

⏳ View Integration: 75+ views need PowerShell integration using established patterns

Production Readiness: Complete After Implementation ✅
✅ Core infrastructure production-ready

⏳ Implementation epics completion required

⏳ View integration completion required

📚 DOCUMENTATION REFERENCES
Completed Infrastructure: FINISHED.md
Session Summary: SESSION_COMPLETE_SUMMARY.md
Architecture Analysis: ARCHITECTURE_ANALYSIS_COMPLETE.md
Gap Analysis: COMPREHENSIVE_GAP_ANALYSIS.md

Build Process: All PowerShell modules automatically copied via buildguiv2.ps1
Working Patterns: Reference UsersView, GroupsView, and discovery view implementations