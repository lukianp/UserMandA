# Epic 1 Task 1.2: UserDetailView Component Architecture

**Document Version:** 1.0
**Created:** October 4, 2025
**Author:** Ultra-Autonomous Senior Technical Architecture Lead
**Status:** Ready for Implementation

---

## Executive Summary

This document provides a comprehensive architectural design for the UserDetailView component, which enables deep-drill user analysis by correlating data across multiple discovery modules. The implementation replicates and enhances the functionality of `/GUI/Views/UserDetailWindow.xaml` in the modern TypeScript/React/Electron stack.

**Key Design Principles:**
- **100% Feature Parity** with WPF UserDetailWindow (9-tab structure, all correlations)
- **Performance Optimized** with lazy loading, virtualization, and caching
- **Logic Engine Integration** for automatic data correlation
- **Tab-Based Navigation** supporting multiple concurrent user detail views
- **Accessibility Compliant** with full keyboard navigation and screen reader support

**Impact Assessment:**
- **New Components:** 2 (UserDetailView.tsx, user detail type definitions)
- **New Hooks:** 1 (useUserDetailLogic.ts)
- **New IPC Handlers:** 1 ('get-user-detail')
- **Service Dependencies:** LogicEngineService (Epic 4), PowerShellService, TabStore
- **Performance:** Sub-500ms load time with caching, 60fps UI rendering

---

## 1. Component Architecture

### 1.1 File Organization

```
guiv2/
├── src/
│   ├── main/
│   │   ├── ipcHandlers.ts                    # Enhanced with 'get-user-detail' handler
│   │   └── services/
│   │       └── logicEngineService.ts         # Port from Epic 4 (C# LogicEngineService)
│   └── renderer/
│       ├── components/
│       │   └── organisms/
│       │       ├── TabView.tsx                # Routes to UserDetailView via dynamic import
│       │       └── DataGridWrapper.tsx        # Reused for detail grids (devices, apps, etc.)
│       ├── hooks/
│       │   └── useUserDetailLogic.ts         # NEW: Core user detail business logic
│       ├── types/
│       │   └── models/
│       │       ├── user.ts                    # ENHANCED: Add UserDetailProjection interface
│       │       ├── device.ts                  # Referenced for Devices tab
│       │       ├── application.ts             # Referenced for Apps tab
│       │       ├── group.ts                   # Referenced for Groups tab
│       │       ├── gpo.ts                     # Referenced for GPOs tab
│       │       ├── fileAccess.ts              # Referenced for File Access tab
│       │       ├── mailbox.ts                 # Referenced for Mailbox tab
│       │       ├── azureRole.ts               # Referenced for Azure Roles tab
│       │       ├── sqlDatabase.ts             # Referenced for SQL tab
│       │       └── risk.ts                    # Referenced for Risks tab
│       └── views/
│           └── users/
│               ├── UsersView.tsx              # ENHANCED: Add "View Details" context menu
│               └── UserDetailView.tsx         # NEW: Main component (this document)
```

### 1.2 Component Hierarchy

```
UserDetailView (Main Container)
├── Header Section
│   ├── User Display Name (H1)
│   ├── Subtitle ("Comprehensive user information...")
│   └── Action Buttons
│       ├── Refresh Button → Reload data from LogicEngine
│       ├── Add to Wave Button → Open MigrationWaveDialog
│       ├── Export Button → Export user snapshot (JSON/CSV)
│       └── Close Button → Close tab
│
├── User Summary Card (3-Column Grid)
│   ├── Column 1: User Information
│   │   ├── Display Name
│   │   ├── UPN (UserPrincipalName)
│   │   └── Email
│   ├── Column 2: Organization
│   │   ├── Department
│   │   ├── Job Title
│   │   └── Manager
│   └── Column 3: Account Status
│       ├── Status (Enabled/Disabled)
│       ├── Created Date
│       └── Last Sign-In
│
├── Loading Overlay (Conditional)
│   ├── Spinner Animation
│   └── Loading Message
│
├── Tab Control (9 Tabs)
│   ├── Tab 1: Overview
│   │   └── Resource/Services Summary Cards
│   ├── Tab 2: Devices
│   │   └── DataGridWrapper (DeviceDto[])
│   ├── Tab 3: Apps
│   │   └── DataGridWrapper (AppDto[])
│   ├── Tab 4: Groups
│   │   └── DataGridWrapper (GroupDto[])
│   ├── Tab 5: GPOs
│   │   ├── GPO Links DataGridWrapper
│   │   └── GPO Security Filters DataGridWrapper
│   ├── Tab 6: File Access
│   │   └── DataGridWrapper (AclEntry[])
│   ├── Tab 7: Mailbox
│   │   └── Mailbox Details Card (if exists)
│   ├── Tab 8: Azure Roles
│   │   └── DataGridWrapper (AzureRoleAssignment[])
│   └── Tab 9: SQL & Risks
│       ├── SQL Databases DataGridWrapper
│       └── Risk Assessment DataGridWrapper
│
└── Status Bar
    └── Status Message (e.g., "Ready", "Loaded 234 items", "Error: ...")
```

---

## 2. Data Models & TypeScript Interfaces

### 2.1 UserDetailProjection Interface

**File:** `guiv2/src/renderer/types/models/user.ts`

```typescript
/**
 * User Detail Projection
 * Complete user data with all correlated entities
 * Mirrors C# UserDetailProjection from LogicEngineModels.cs (lines 261-282)
 */
export interface UserDetailProjection {
  // Core User Data (from UserDto)
  user: UserData;

  // Related Entities (correlated by LogicEngineService)
  groups: GroupData[];
  devices: DeviceData[];
  apps: ApplicationData[];
  drives: MappedDriveData[];
  fileAccess: FileAccessEntry[];
  gpoLinks: GpoData[];
  gpoFilters: GpoData[];
  mailbox: MailboxData | null;
  azureRoles: AzureRoleAssignment[];
  sqlDatabases: SqlDatabaseData[];
  risks: RiskItem[];
  migrationHints: MigrationHint[];

  // Computed Properties (mirror C# computed properties)
  memberOfGroups: string[];        // Groups.Select(g => g.Name)
  managedGroups: string[];         // Groups.Where(g => g.ManagedBy == User.Dn)
  managerUpn: string;              // User.Manager
  ownedGroups: string[];           // Groups.Where(g => g.ManagedBy == User.Dn)
}

/**
 * Risk Item
 * Represents a detected risk or compliance issue
 */
export interface RiskItem {
  type: string;                     // e.g., "AdminWithoutMFA", "StaleAccount"
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  recommendation: string;
  affectedEntity: string;           // SID, Name, or other identifier
  detectedAt: Date | string;
}

/**
 * Migration Hint
 * Suggestions for migration planning
 */
export interface MigrationHint {
  category: string;                 // e.g., "Device", "Application", "Group"
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  actionRequired: boolean;
}

/**
 * Mapped Drive Data
 */
export interface MappedDriveData {
  driveLetter: string;              // e.g., "Z:"
  uncPath: string;                  // e.g., "\\server\share"
  userSid: string;
  persistent: boolean;
  label?: string;
}

/**
 * File Access Entry (ACL)
 */
export interface FileAccessEntry {
  path: string;                     // File/folder path or share name
  rights: string;                   // e.g., "FullControl", "Read", "Modify"
  inherited: boolean;               // Is this an inherited permission?
  isShare: boolean;                 // Is this a share-level permission?
  isNtfs: boolean;                  // Is this an NTFS permission?
  identitySid: string;              // User/group SID with this permission
}

/**
 * GPO Data
 */
export interface GpoData {
  name: string;
  guid: string;
  enabled: boolean;
  wmiFilter?: string;
  linkedOu?: string;
}

/**
 * Mailbox Data
 */
export interface MailboxData {
  mailboxGuid: string;
  userPrincipalName: string;
  sizeMb: number;
  type: 'UserMailbox' | 'SharedMailbox' | 'RoomMailbox';
  itemCount?: number;
  database?: string;
}

/**
 * Azure Role Assignment
 */
export interface AzureRoleAssignment {
  roleName: string;                 // e.g., "Global Administrator"
  scope: string;                    // e.g., "/subscriptions/xyz" or "Directory"
  principalObjectId: string;        // Azure Object ID
  principalType: 'User' | 'Group' | 'ServicePrincipal';
  assignmentId: string;
}

/**
 * SQL Database Access
 */
export interface SqlDatabaseData {
  server: string;
  instance: string;
  database: string;
  role?: string;                    // e.g., "db_owner", "db_datareader"
  appHints?: string;                // Detected application usage
}
```

### 2.2 Additional Type Enhancements

**File:** `guiv2/src/renderer/types/models/device.ts`

```typescript
// Add to existing DeviceData interface if not present
export interface DeviceData extends Identifiable, Named {
  name: string;
  dns: string | null;
  os: string | null;
  ou: string | null;
  primaryUserSid: string | null;
  lastSeen?: Date | string | null;
  ipAddress?: string | null;
  manufacturer?: string | null;
  model?: string | null;
}
```

**File:** `guiv2/src/renderer/types/models/application.ts`

```typescript
export interface ApplicationData extends Identifiable, Named {
  name: string;
  source: 'SCCM' | 'IntuneWin32' | 'Registry' | 'CSV';
  installCounts: number;            // Number of installations discovered
  publishers: string;               // Comma-separated publisher names
  versions?: string[];              // Discovered versions
}
```

**File:** `guiv2/src/renderer/types/models/group.ts`

```typescript
export interface GroupData extends Identifiable, Named {
  name: string;
  sid: string;
  type: 'Security' | 'Distribution' | 'DynamicGroup';
  dn?: string;                      // Distinguished Name
  managedBy?: string;               // DN of manager
  members: string[];                // Array of member SIDs
  description?: string;
}
```

---

## 3. Business Logic Hook: useUserDetailLogic.ts

### 3.1 Hook Signature

**File:** `guiv2/src/renderer/hooks/useUserDetailLogic.ts`

```typescript
/**
 * User Detail Logic Hook
 *
 * Manages data loading, caching, and actions for UserDetailView.
 * Mirrors C# UserDetailViewModel.cs business logic (lines 34-196).
 *
 * @param userId - User identifier (SID or UPN)
 * @returns User detail state and actions
 */
export function useUserDetailLogic(userId: string) {
  // State
  const [userDetail, setUserDetail] = useState<UserDetailProjection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing...');
  const [selectedTab, setSelectedTab] = useState<number>(0); // 0-8 for 9 tabs

  // Store access
  const { closeTab } = useTabStore();
  const { openModal } = useModalStore();
  const { addItemToWave } = useMigrationStore();
  const { showNotification } = useNotificationStore();

  // Load user detail on mount or userId change
  useEffect(() => {
    loadUserDetail();
  }, [userId]);

  // Core Actions
  const loadUserDetail = async () => { /* ... */ };
  const refreshData = async () => { /* ... */ };
  const addToMigrationWave = () => { /* ... */ };
  const exportSnapshot = async (format: 'json' | 'csv') => { /* ... */ };
  const closeView = () => { /* ... */ };

  return {
    // State
    userDetail,
    isLoading,
    error,
    loadingMessage,
    selectedTab,

    // Actions
    setSelectedTab,
    refreshData,
    addToMigrationWave,
    exportSnapshot,
    closeView,
  };
}
```

### 3.2 Core Logic Implementation

```typescript
import { useState, useEffect } from 'react';
import { UserDetailProjection } from '../types/models/user';
import { useTabStore } from '../store/useTabStore';
import { useModalStore } from '../store/useModalStore';
import { useMigrationStore } from '../store/useMigrationStore';
import { useNotificationStore } from '../store/useNotificationStore';

export function useUserDetailLogic(userId: string) {
  const [userDetail, setUserDetail] = useState<UserDetailProjection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing...');
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const { closeTab } = useTabStore();
  const { openModal } = useModalStore();
  const { addItemToWave } = useMigrationStore();
  const { showNotification } = useNotificationStore();

  useEffect(() => {
    loadUserDetail();
  }, [userId]);

  /**
   * Load user detail from LogicEngineService via IPC
   * Mirrors C# LoadUserDetailAsync (lines 141-166)
   */
  const loadUserDetail = async () => {
    if (!userId) {
      setError('No user identifier provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setLoadingMessage('Loading user data from LogicEngine...');

      // Call IPC handler 'get-user-detail'
      const result = await window.electron.invoke<UserDetailProjection>(
        'get-user-detail',
        { userId }
      );

      if (!result) {
        throw new Error('User not found');
      }

      setUserDetail(result);
      setLoadingMessage('');

      showNotification({
        type: 'success',
        message: `Loaded details for ${result.user.displayName}`,
        duration: 3000,
      });
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to load user details';
      setError(errorMsg);

      showNotification({
        type: 'error',
        message: errorMsg,
        duration: 5000,
      });

      console.error('User detail load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh user data (clear cache, reload)
   * Mirrors C# RefreshDataCommand
   */
  const refreshData = async () => {
    // Clear any cached data for this user
    await window.electron.invoke('clear-user-detail-cache', { userId });

    // Reload
    await loadUserDetail();
  };

  /**
   * Add user to migration wave
   * Opens MigrationWaveDialog with user pre-selected
   */
  const addToMigrationWave = () => {
    if (!userDetail) return;

    openModal({
      component: 'MigrationWaveDialog',
      props: {
        preSelectedItems: [{
          id: userDetail.user.id,
          type: 'user',
          displayName: userDetail.user.displayName,
        }],
        onConfirm: (waveId: string) => {
          addItemToWave(waveId, {
            id: userDetail.user.id,
            type: 'user',
            displayName: userDetail.user.displayName,
          });

          showNotification({
            type: 'success',
            message: `Added ${userDetail.user.displayName} to migration wave`,
            duration: 3000,
          });
        },
      },
    });
  };

  /**
   * Export user snapshot to JSON or CSV
   * Mirrors C# ExportSnapshotCommand
   */
  const exportSnapshot = async (format: 'json' | 'csv') => {
    if (!userDetail) return;

    try {
      const fileName = `user_${userDetail.user.userPrincipalName}_${Date.now()}.${format}`;

      await window.electron.invoke('export-user-snapshot', {
        userDetail,
        format,
        fileName,
      });

      showNotification({
        type: 'success',
        message: `Exported user snapshot to ${fileName}`,
        duration: 3000,
      });
    } catch (err: any) {
      showNotification({
        type: 'error',
        message: `Export failed: ${err?.message}`,
        duration: 5000,
      });
    }
  };

  /**
   * Close the user detail view tab
   * Mirrors C# CloseCommand (lines 192-196)
   */
  const closeView = () => {
    // Find and close the current tab
    const currentTabId = useTabStore.getState().selectedTabId;
    if (currentTabId) {
      closeTab(currentTabId);
    }
  };

  return {
    userDetail,
    isLoading,
    error,
    loadingMessage,
    selectedTab,
    setSelectedTab,
    refreshData,
    addToMigrationWave,
    exportSnapshot,
    closeView,
  };
}
```

---

## 4. Component Implementation: UserDetailView.tsx

### 4.1 Component Structure

**File:** `guiv2/src/renderer/views/users/UserDetailView.tsx`

```typescript
/**
 * UserDetailView Component
 *
 * Comprehensive user detail view with 9-tab structure.
 * Replicates /GUI/Views/UserDetailView.xaml functionality (lines 1-539).
 *
 * Features:
 * - User summary card with 3-column layout
 * - 9 data correlation tabs (Overview, Devices, Apps, Groups, GPOs, File Access, Mailbox, Azure Roles, SQL & Risks)
 * - Action buttons (Refresh, Add to Wave, Export, Close)
 * - Loading overlay with progress messages
 * - Status bar with real-time messages
 * - Full keyboard navigation and accessibility
 *
 * @param userId - User identifier (SID or UPN) passed via tab data
 */

import React from 'react';
import { useUserDetailLogic } from '../../hooks/useUserDetailLogic';
import { Button } from '../../components/atoms/Button';
import { LoadingOverlay } from '../../components/molecules/LoadingOverlay';
import { DataGridWrapper } from '../../components/organisms/DataGridWrapper';
import { ModernCard } from '../../components/atoms/ModernCard';
import { RefreshCw, UserPlus, Download, X } from 'lucide-react';
import { ColDef } from 'ag-grid-community';

interface UserDetailViewProps {
  userId: string;
}

export const UserDetailView: React.FC<UserDetailViewProps> = ({ userId }) => {
  const {
    userDetail,
    isLoading,
    error,
    loadingMessage,
    selectedTab,
    setSelectedTab,
    refreshData,
    addToMigrationWave,
    exportSnapshot,
    closeView,
  } = useUserDetailLogic(userId);

  // Render error state
  if (error && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <ModernCard className="p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Error Loading User Details</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refreshData} variant="primary">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </ModernCard>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col p-6">
      {/* Loading Overlay */}
      {isLoading && (
        <LoadingOverlay
          message={loadingMessage}
          isVisible={isLoading}
        />
      )}

      {/* Header Section */}
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {userDetail?.user.displayName || 'User Details'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive user information and related assets
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={refreshData}
            variant="primary"
            disabled={isLoading}
            title="Refresh user data"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button
            onClick={addToMigrationWave}
            variant="secondary"
            disabled={isLoading || !userDetail}
            title="Add user to migration wave"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add to Wave
          </Button>

          <Button
            onClick={() => exportSnapshot('json')}
            variant="secondary"
            disabled={isLoading || !userDetail}
            title="Export user details"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button
            onClick={closeView}
            variant="danger"
            title="Close user details"
          >
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </header>

      {/* User Summary Card - Only show when data is loaded */}
      {userDetail && (
        <ModernCard className="mb-6 p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Column 1: User Information */}
            <div>
              <h3 className="text-base font-semibold mb-4 flex items-center">
                <span className="mr-2">👤</span>
                User Information
              </h3>
              <div className="space-y-3">
                <LabelValuePair
                  label="Display Name"
                  value={userDetail.user.displayName}
                />
                <LabelValuePair
                  label="UPN"
                  value={userDetail.user.userPrincipalName}
                />
                <LabelValuePair
                  label="Email"
                  value={userDetail.user.mail}
                />
              </div>
            </div>

            {/* Column 2: Organization */}
            <div>
              <h3 className="text-base font-semibold mb-4 flex items-center">
                <span className="mr-2">🏢</span>
                Organization
              </h3>
              <div className="space-y-3">
                <LabelValuePair
                  label="Department"
                  value={userDetail.user.department || 'N/A'}
                />
                <LabelValuePair
                  label="Job Title"
                  value={userDetail.user.jobTitle || 'N/A'}
                />
                <LabelValuePair
                  label="Manager"
                  value={userDetail.managerUpn || 'N/A'}
                />
              </div>
            </div>

            {/* Column 3: Account Status */}
            <div>
              <h3 className="text-base font-semibold mb-4 flex items-center">
                <span className="mr-2">📅</span>
                Account Status
              </h3>
              <div className="space-y-3">
                <LabelValuePair
                  label="Status"
                  value={userDetail.user.accountEnabled ? 'Enabled' : 'Disabled'}
                />
                <LabelValuePair
                  label="Created"
                  value={formatDate(userDetail.user.createdDateTime)}
                />
                <LabelValuePair
                  label="Last Sign-In"
                  value={formatDateTime(userDetail.user.lastSignInDateTime)}
                />
              </div>
            </div>
          </div>
        </ModernCard>
      )}

      {/* 9-Tab Control */}
      {userDetail && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            {TAB_CONFIG.map((tab, index) => (
              <button
                key={index}
                onClick={() => setSelectedTab(index)}
                className={`
                  px-4 py-3 font-medium text-sm transition-colors
                  ${selectedTab === index
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">
            {renderTabContent(selectedTab, userDetail)}
          </div>
        </div>
      )}

      {/* Status Bar */}
      <footer className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isLoading ? loadingMessage : 'Ready'}
        </p>
      </footer>
    </div>
  );
};

/**
 * Tab configuration
 */
const TAB_CONFIG = [
  { label: 'Overview', icon: '📊' },
  { label: 'Devices', icon: '🖥️' },
  { label: 'Apps', icon: '📱' },
  { label: 'Groups', icon: '👥' },
  { label: 'GPOs', icon: '🛡️' },
  { label: 'File Access', icon: '📁' },
  { label: 'Mailbox', icon: '📧' },
  { label: 'Azure Roles', icon: '☁️' },
  { label: 'SQL & Risks', icon: '⚠️' },
];

/**
 * Render tab content based on selected tab index
 */
function renderTabContent(tabIndex: number, userDetail: UserDetailProjection): React.ReactNode {
  switch (tabIndex) {
    case 0:
      return <OverviewTab userDetail={userDetail} />;
    case 1:
      return <DevicesTab devices={userDetail.devices} />;
    case 2:
      return <AppsTab apps={userDetail.apps} />;
    case 3:
      return <GroupsTab groups={userDetail.groups} />;
    case 4:
      return <GposTab gpoLinks={userDetail.gpoLinks} gpoFilters={userDetail.gpoFilters} />;
    case 5:
      return <FileAccessTab fileAccess={userDetail.fileAccess} />;
    case 6:
      return <MailboxTab mailbox={userDetail.mailbox} />;
    case 7:
      return <AzureRolesTab azureRoles={userDetail.azureRoles} />;
    case 8:
      return <SqlRisksTab sqlDatabases={userDetail.sqlDatabases} risks={userDetail.risks} />;
    default:
      return null;
  }
}

/**
 * Label-Value pair component for summary card
 */
const LabelValuePair: React.FC<{ label: string; value: string | null | undefined }> = ({ label, value }) => (
  <div className="flex">
    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-32">{label}:</span>
    <span className="text-sm text-gray-900 dark:text-gray-100">{value || 'N/A'}</span>
  </div>
);

/**
 * Date formatting utilities
 */
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
```

### 4.2 Individual Tab Components

**Each tab component will be defined in the same file for simplicity:**

```typescript
/**
 * Tab 1: Overview
 * Shows resource/services summary counts
 */
const OverviewTab: React.FC<{ userDetail: UserDetailProjection }> = ({ userDetail }) => (
  <ModernCard className="p-6">
    <h3 className="text-lg font-semibold mb-4">User Overview Summary</h3>
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold mb-3">Resource Summary</h4>
        <ul className="space-y-2 text-sm">
          <li>Groups: {userDetail.groups.length}</li>
          <li>Devices: {userDetail.devices.length}</li>
          <li>Applications: {userDetail.apps.length}</li>
          <li>File Access Entries: {userDetail.fileAccess.length}</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Services Summary</h4>
        <ul className="space-y-2 text-sm">
          <li>Mapped Drives: {userDetail.drives.length}</li>
          <li>Azure Roles: {userDetail.azureRoles.length}</li>
          <li>SQL Databases: {userDetail.sqlDatabases.length}</li>
          <li>Risk Items: {userDetail.risks.length}</li>
        </ul>
      </div>
    </div>
  </ModernCard>
);

/**
 * Tab 2: Devices
 */
const DevicesTab: React.FC<{ devices: DeviceData[] }> = ({ devices }) => {
  const columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Device Name', width: 200 },
    { field: 'dns', headerName: 'DNS Name', width: 200 },
    { field: 'os', headerName: 'OS', width: 150 },
    { field: 'ou', headerName: 'OU', width: 200 },
    { field: 'primaryUserSid', headerName: 'Primary User', width: 150 },
  ];

  return (
    <DataGridWrapper
      rowData={devices}
      columnDefs={columnDefs}
      height="100%"
    />
  );
};

/**
 * Tab 3: Apps
 */
const AppsTab: React.FC<{ apps: ApplicationData[] }> = ({ apps }) => {
  const columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Application Name', width: 250 },
    { field: 'source', headerName: 'Source', width: 150 },
    { field: 'installCounts', headerName: 'Install Count', width: 120 },
    { field: 'publishers', headerName: 'Publishers', width: 200 },
  ];

  return (
    <DataGridWrapper
      rowData={apps}
      columnDefs={columnDefs}
      height="100%"
    />
  );
};

/**
 * Tab 4: Groups
 */
const GroupsTab: React.FC<{ groups: GroupData[] }> = ({ groups }) => {
  const columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Group Name', width: 250 },
    { field: 'type', headerName: 'Type', width: 150 },
    { field: 'sid', headerName: 'SID', width: 200 },
    {
      field: 'members',
      headerName: 'Member Count',
      width: 120,
      valueGetter: (params) => params.data?.members?.length || 0
    },
  ];

  return (
    <DataGridWrapper
      rowData={groups}
      columnDefs={columnDefs}
      height="100%"
    />
  );
};

/**
 * Tab 5: GPOs
 * Split into two sections: GPO Links and GPO Security Filters
 */
const GposTab: React.FC<{ gpoLinks: GpoData[]; gpoFilters: GpoData[] }> = ({ gpoLinks, gpoFilters }) => {
  const linkColumnDefs: ColDef[] = [
    { field: 'name', headerName: 'GPO Name', width: 200 },
    { field: 'guid', headerName: 'GUID', width: 250 },
    { field: 'enabled', headerName: 'Enabled', width: 80, cellDataType: 'boolean' },
  ];

  const filterColumnDefs: ColDef[] = [
    { field: 'name', headerName: 'GPO Name', width: 200 },
    { field: 'guid', headerName: 'GUID', width: 250 },
    { field: 'wmiFilter', headerName: 'WMI Filter', width: 150 },
  ];

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1">
        <h3 className="text-sm font-semibold mb-2">GPO Links</h3>
        <DataGridWrapper
          rowData={gpoLinks}
          columnDefs={linkColumnDefs}
          height="100%"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold mb-2">GPO Security Filters</h3>
        <DataGridWrapper
          rowData={gpoFilters}
          columnDefs={filterColumnDefs}
          height="100%"
        />
      </div>
    </div>
  );
};

/**
 * Tab 6: File Access
 */
const FileAccessTab: React.FC<{ fileAccess: FileAccessEntry[] }> = ({ fileAccess }) => {
  const columnDefs: ColDef[] = [
    { field: 'path', headerName: 'Path', width: 300 },
    { field: 'rights', headerName: 'Rights', width: 150 },
    { field: 'inherited', headerName: 'Inherited', width: 80, cellDataType: 'boolean' },
    { field: 'isShare', headerName: 'Is Share', width: 80, cellDataType: 'boolean' },
    { field: 'isNtfs', headerName: 'Is NTFS', width: 80, cellDataType: 'boolean' },
  ];

  return (
    <DataGridWrapper
      rowData={fileAccess}
      columnDefs={columnDefs}
      height="100%"
    />
  );
};

/**
 * Tab 7: Mailbox
 */
const MailboxTab: React.FC<{ mailbox: MailboxData | null }> = ({ mailbox }) => {
  if (!mailbox) {
    return (
      <ModernCard className="p-6">
        <p className="text-gray-600">No mailbox data available for this user.</p>
      </ModernCard>
    );
  }

  return (
    <ModernCard className="p-6">
      <h3 className="text-lg font-semibold mb-4">Mailbox Information</h3>
      <div className="space-y-3">
        <LabelValuePair label="Mailbox GUID" value={mailbox.mailboxGuid} />
        <LabelValuePair label="Size (MB)" value={mailbox.sizeMb?.toString()} />
        <LabelValuePair label="Type" value={mailbox.type} />
        <LabelValuePair label="Item Count" value={mailbox.itemCount?.toString()} />
        <LabelValuePair label="Database" value={mailbox.database} />
      </div>
    </ModernCard>
  );
};

/**
 * Tab 8: Azure Roles
 */
const AzureRolesTab: React.FC<{ azureRoles: AzureRoleAssignment[] }> = ({ azureRoles }) => {
  const columnDefs: ColDef[] = [
    { field: 'roleName', headerName: 'Role Name', width: 200 },
    { field: 'scope', headerName: 'Scope', width: 250 },
    { field: 'principalObjectId', headerName: 'Principal ID', width: 200 },
  ];

  return (
    <DataGridWrapper
      rowData={azureRoles}
      columnDefs={columnDefs}
      height="100%"
    />
  );
};

/**
 * Tab 9: SQL & Risks
 * Split into two sections: SQL Databases and Risk Assessment
 */
const SqlRisksTab: React.FC<{ sqlDatabases: SqlDatabaseData[]; risks: RiskItem[] }> = ({ sqlDatabases, risks }) => {
  const sqlColumnDefs: ColDef[] = [
    { field: 'server', headerName: 'Server', width: 150 },
    { field: 'instance', headerName: 'Instance', width: 150 },
    { field: 'database', headerName: 'Database', width: 150 },
    { field: 'appHints', headerName: 'App Hints', width: 200 },
  ];

  const riskColumnDefs: ColDef[] = [
    { field: 'type', headerName: 'Risk Type', width: 150 },
    { field: 'severity', headerName: 'Severity', width: 100 },
    { field: 'description', headerName: 'Description', width: 300 },
    { field: 'recommendation', headerName: 'Recommendation', width: 250 },
  ];

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1">
        <h3 className="text-sm font-semibold mb-2">SQL Databases</h3>
        <DataGridWrapper
          rowData={sqlDatabases}
          columnDefs={sqlColumnDefs}
          height="100%"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold mb-2">Risk Assessment</h3>
        <DataGridWrapper
          rowData={risks}
          columnDefs={riskColumnDefs}
          height="100%"
        />
      </div>
    </div>
  );
};
```

---

## 5. IPC Handler Implementation

### 5.1 Main Process Handler

**File:** `guiv2/src/main/ipcHandlers.ts` (add to existing handlers)

```typescript
/**
 * IPC Handler: get-user-detail
 *
 * Retrieves comprehensive user detail projection from LogicEngineService.
 * Mirrors C# GetUserDetailAsync (LogicEngineService.cs lines 204-221).
 *
 * @param userId - User SID or UPN
 * @returns UserDetailProjection with all correlated data
 */
ipcMain.handle('get-user-detail', async (event, args: { userId: string }) => {
  const { userId } = args;

  try {
    // Get LogicEngineService instance (singleton)
    const logicEngine = LogicEngineService.getInstance();

    // Ensure data is loaded
    if (!logicEngine.isLoaded()) {
      await logicEngine.loadAllAsync();
    }

    // Build user detail projection
    const userDetail = await logicEngine.getUserDetailAsync(userId);

    if (!userDetail) {
      throw new Error(`User not found: ${userId}`);
    }

    return {
      success: true,
      data: userDetail,
    };
  } catch (error: any) {
    console.error('get-user-detail error:', error);
    return {
      success: false,
      error: error.message || 'Failed to retrieve user details',
    };
  }
});

/**
 * IPC Handler: clear-user-detail-cache
 *
 * Clears cached user detail data for a specific user.
 * Forces fresh data retrieval on next load.
 */
ipcMain.handle('clear-user-detail-cache', async (event, args: { userId: string }) => {
  const { userId } = args;

  try {
    const logicEngine = LogicEngineService.getInstance();
    logicEngine.clearUserDetailCache(userId);

    return { success: true };
  } catch (error: any) {
    console.error('clear-user-detail-cache error:', error);
    return { success: false, error: error.message };
  }
});

/**
 * IPC Handler: export-user-snapshot
 *
 * Exports user detail snapshot to JSON or CSV file.
 *
 * @param userDetail - UserDetailProjection to export
 * @param format - 'json' or 'csv'
 * @param fileName - Output file name
 */
ipcMain.handle('export-user-snapshot', async (event, args: {
  userDetail: UserDetailProjection;
  format: 'json' | 'csv';
  fileName: string;
}) => {
  const { userDetail, format, fileName } = args;

  try {
    const exportPath = path.join(app.getPath('downloads'), fileName);

    if (format === 'json') {
      await fs.promises.writeFile(
        exportPath,
        JSON.stringify(userDetail, null, 2),
        'utf-8'
      );
    } else {
      // Convert to CSV (flatten nested structures)
      const csv = convertUserDetailToCSV(userDetail);
      await fs.promises.writeFile(exportPath, csv, 'utf-8');
    }

    return { success: true, filePath: exportPath };
  } catch (error: any) {
    console.error('export-user-snapshot error:', error);
    return { success: false, error: error.message };
  }
});

/**
 * Helper: Convert UserDetailProjection to CSV format
 */
function convertUserDetailToCSV(userDetail: UserDetailProjection): string {
  const rows: string[] = [];

  // Header
  rows.push('Section,Key,Value');

  // User Info
  rows.push(`User,Display Name,${userDetail.user.displayName}`);
  rows.push(`User,UPN,${userDetail.user.userPrincipalName}`);
  rows.push(`User,Email,${userDetail.user.mail}`);
  rows.push(`User,Department,${userDetail.user.department}`);
  rows.push(`User,Job Title,${userDetail.user.jobTitle}`);

  // Groups
  userDetail.groups.forEach((group, i) => {
    rows.push(`Groups,Group ${i + 1},${group.name}`);
  });

  // Devices
  userDetail.devices.forEach((device, i) => {
    rows.push(`Devices,Device ${i + 1},${device.name}`);
  });

  // Apps
  userDetail.apps.forEach((app, i) => {
    rows.push(`Apps,App ${i + 1},${app.name}`);
  });

  // Azure Roles
  userDetail.azureRoles.forEach((role, i) => {
    rows.push(`Azure Roles,Role ${i + 1},${role.roleName}`);
  });

  // Risks
  userDetail.risks.forEach((risk, i) => {
    rows.push(`Risks,Risk ${i + 1},"${risk.severity}: ${risk.description}"`);
  });

  return rows.join('\n');
}
```

### 5.2 Preload Script Enhancement

**File:** `guiv2/src/preload.ts` (add to existing API)

```typescript
// Add to electronAPI object
const electronAPI = {
  // ... existing methods ...

  invoke: <T = any>(channel: string, args?: any): Promise<T> => {
    return ipcRenderer.invoke(channel, args);
  },
};

// Export types
export type ElectronAPI = typeof electronAPI;
```

### 5.3 TypeScript Declarations

**File:** `guiv2/src/renderer/types/electron.d.ts` (enhance existing)

```typescript
declare global {
  interface Window {
    electron: {
      invoke: <T = any>(channel: string, args?: any) => Promise<T>;
      // ... existing methods ...
    };
  }
}

export {};
```

---

## 6. Integration with Existing Infrastructure

### 6.1 UsersView Enhancement

**File:** `guiv2/src/renderer/views/users/UsersView.tsx`

Add "View Details" context menu action:

```typescript
// In UsersView.tsx column definitions
const columnDefs: ColDef[] = [
  // ... existing columns ...
  {
    headerName: 'Actions',
    width: 100,
    cellRenderer: (params: any) => {
      return (
        <button
          onClick={() => handleViewDetails(params.data)}
          className="text-blue-600 hover:text-blue-800"
        >
          View Details
        </button>
      );
    },
  },
];

// Add handler
const handleViewDetails = (user: UserData) => {
  const { openTab } = useTabStore.getState();

  openTab({
    title: `User: ${user.displayName}`,
    component: 'UserDetailView',
    icon: 'User',
    closable: true,
    data: {
      userId: user.userPrincipalName || user.id,
    },
  });
};
```

### 6.2 TabView Dynamic Import

**File:** `guiv2/src/renderer/components/organisms/TabView.tsx`

Add UserDetailView to dynamic import registry:

```typescript
const VIEW_COMPONENTS = {
  OverviewView: React.lazy(() => import('../../views/OverviewView')),
  UsersView: React.lazy(() => import('../../views/users/UsersView')),
  UserDetailView: React.lazy(() => import('../../views/users/UserDetailView')), // NEW
  // ... other views ...
};

// In render method
const renderTabContent = (tab: Tab) => {
  const Component = VIEW_COMPONENTS[tab.component];

  if (!Component) {
    return <div>Unknown view: {tab.component}</div>;
  }

  return (
    <React.Suspense fallback={<LoadingOverlay message="Loading view..." isVisible={true} />}>
      <Component {...(tab.data || {})} />
    </React.Suspense>
  );
};
```

---

## 7. Logic Engine Service (Epic 4 Dependency)

### 7.1 Service Interface

**File:** `guiv2/src/main/services/logicEngineService.ts`

This is a **dependency on Epic 4** (Logic Engine Implementation). The service must expose:

```typescript
/**
 * Logic Engine Service
 *
 * Singleton service that loads, correlates, and projects discovery data.
 * Port of C# LogicEngineService.cs (lines 18-200+).
 */
export class LogicEngineService {
  private static instance: LogicEngineService;
  private loaded: boolean = false;

  // Data stores (mirrors C# ConcurrentDictionary structures)
  private usersBySid: Map<string, UserDto> = new Map();
  private usersByUpn: Map<string, UserDto> = new Map();
  private groupsBySid: Map<string, GroupDto> = new Map();
  // ... other data stores ...

  private constructor() {}

  public static getInstance(): LogicEngineService {
    if (!LogicEngineService.instance) {
      LogicEngineService.instance = new LogicEngineService();
    }
    return LogicEngineService.instance;
  }

  /**
   * Load all CSV data and apply inference rules
   * Mirrors C# LoadAllAsync (lines 92-200)
   */
  public async loadAllAsync(): Promise<boolean> {
    // Implementation in Epic 4
    // - Load CSVs from profile data path
    // - Parse into typed DTOs
    // - Build indices (SID, UPN, etc.)
    // - Apply inference rules (ACL correlation, primary device, etc.)
    this.loaded = true;
    return true;
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Get user detail projection with all correlated data
   * Mirrors C# GetUserDetailAsync (lines 204-221)
   *
   * @param userId - User SID or UPN
   * @returns UserDetailProjection with correlated entities
   */
  public async getUserDetailAsync(userId: string): Promise<UserDetailProjection | null> {
    return this.buildUserDetailProjection(userId);
  }

  /**
   * Build user detail projection
   * Mirrors C# BuildUserDetailProjection (lines 223-260)
   */
  private buildUserDetailProjection(userId: string): UserDetailProjection | null {
    // 1. Find user by SID or UPN
    const user = this.usersBySid.get(userId) || this.usersByUpn.get(userId);
    if (!user) return null;

    // 2. Correlate groups (via groupsByUserSid index)
    const groups = this.getGroupsForUser(user.sid);

    // 3. Correlate devices (via devicesByPrimaryUserSid index)
    const devices = this.getDevicesForUser(user.sid);

    // 4. Correlate apps (via devices -> appsByDevice index)
    const apps = this.getAppsForUser(devices);

    // 5. Correlate drives (via drivesByUserSid index)
    const drives = this.getDrivesForUser(user.sid);

    // 6. Correlate file access (via aclByIdentitySid index)
    const fileAccess = this.getFileAccessForUser(user.sid);

    // 7. Correlate GPOs (via gposBySidFilter and getApplicableGpos logic)
    const { gpoLinks, gpoFilters } = this.getGposForUser(user);

    // 8. Get mailbox (via mailboxByUpn index)
    const mailbox = this.getMailboxForUser(user.upn);

    // 9. Get Azure roles (via rolesByPrincipalId index)
    const azureRoles = this.getAzureRolesForUser(user.azureObjectId);

    // 10. Get SQL databases (via user SID correlation)
    const sqlDatabases = this.getSqlDatabasesForUser(user.sid);

    // 11. Calculate risks (mirrors C# CalculateEntityRisks)
    const risks = this.calculateEntityRisks(user.sid, 'User');

    // 12. Generate migration hints (mirrors C# GenerateMigrationHints)
    const migrationHints = this.generateMigrationHints(user.sid, 'User');

    // 13. Compute derived properties
    const memberOfGroups = groups.map(g => g.name);
    const managedGroups = groups.filter(g => g.managedBy === user.dn).map(g => g.name);
    const managerUpn = user.manager || '';
    const ownedGroups = managedGroups; // Same as managedGroups

    return {
      user,
      groups,
      devices,
      apps,
      drives,
      fileAccess,
      gpoLinks,
      gpoFilters,
      mailbox,
      azureRoles,
      sqlDatabases,
      risks,
      migrationHints,
      memberOfGroups,
      managedGroups,
      managerUpn,
      ownedGroups,
    };
  }

  /**
   * Clear cached user detail for a specific user
   */
  public clearUserDetailCache(userId: string): void {
    // If caching is implemented, clear cache entry for this user
    // For now, this is a no-op (data is always fresh from in-memory indices)
  }

  // Private helper methods (implementations in Epic 4)
  private getGroupsForUser(userSid: string): GroupDto[] { /* ... */ return []; }
  private getDevicesForUser(userSid: string): DeviceDto[] { /* ... */ return []; }
  private getAppsForUser(devices: DeviceDto[]): AppDto[] { /* ... */ return []; }
  private getDrivesForUser(userSid: string): MappedDriveDto[] { /* ... */ return []; }
  private getFileAccessForUser(userSid: string): FileAccessEntry[] { /* ... */ return []; }
  private getGposForUser(user: UserDto): { gpoLinks: GpoDto[]; gpoFilters: GpoDto[] } { /* ... */ return { gpoLinks: [], gpoFilters: [] }; }
  private getMailboxForUser(upn: string): MailboxDto | null { /* ... */ return null; }
  private getAzureRolesForUser(azureObjectId: string | null): AzureRoleAssignment[] { /* ... */ return []; }
  private getSqlDatabasesForUser(userSid: string): SqlDatabaseDto[] { /* ... */ return []; }
  private calculateEntityRisks(entityId: string, entityType: string): RiskItem[] { /* ... */ return []; }
  private generateMigrationHints(entityId: string, entityType: string): MigrationHint[] { /* ... */ return []; }
}
```

**Note:** Full implementation of LogicEngineService is beyond the scope of this document. This is a **critical dependency** that must be completed in **Epic 4**.

---

## 8. Performance Architecture

### 8.1 Optimization Strategies

**1. Data Loading:**
- **Lazy Tab Loading:** Only load tab data when user switches to that tab (not on initial render)
- **Virtualized Grids:** Use AG Grid's built-in virtualization for large datasets (1000+ rows)
- **Caching:** LogicEngineService caches user detail projections for 15 minutes (configurable)

**2. Rendering:**
- **React.memo:** Wrap tab components to prevent unnecessary re-renders
- **useMemo:** Memoize column definitions and computed properties
- **Debouncing:** Debounce tab switching to prevent rapid re-renders

**3. Memory Management:**
- **Cleanup:** Unmount event listeners and timers when component unmounts
- **Grid Cleanup:** Destroy AG Grid instances when tabs close
- **Index Optimization:** LogicEngineService uses Map structures for O(1) lookups

### 8.2 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Load Time | < 500ms | Time from tab open to first paint |
| Data Fetch Time | < 300ms | IPC round-trip for user detail |
| Tab Switch Time | < 100ms | Time to render new tab content |
| Grid Render Time | < 200ms | Time to render 1000 rows in grid |
| Memory Usage | < 50MB | Per user detail view instance |
| FPS (Scrolling) | 60 FPS | Smooth scrolling in data grids |

### 8.3 Performance Monitoring

```typescript
// Add to useUserDetailLogic.ts
useEffect(() => {
  const startTime = performance.now();

  loadUserDetail().then(() => {
    const loadTime = performance.now() - startTime;
    console.log(`User detail loaded in ${loadTime.toFixed(2)}ms`);

    // Report to telemetry service (if implemented)
    if (window.electron.reportMetric) {
      window.electron.reportMetric('user_detail_load_time', loadTime);
    }
  });
}, [userId]);
```

---

## 9. Accessibility Architecture

### 9.1 Keyboard Navigation

**Keyboard Shortcuts:**
- **Tab:** Navigate between UI elements (header buttons, tab headers, grid cells)
- **Arrow Keys:** Navigate within data grids
- **Ctrl+R:** Refresh data
- **Ctrl+E:** Export snapshot
- **Ctrl+W:** Close tab
- **Ctrl+1-9:** Switch to tab 1-9

**Implementation:**

```typescript
// Add to UserDetailView.tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey) {
      switch (e.key) {
        case 'r':
          e.preventDefault();
          refreshData();
          break;
        case 'e':
          e.preventDefault();
          exportSnapshot('json');
          break;
        case 'w':
          e.preventDefault();
          closeView();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          setSelectedTab(parseInt(e.key) - 1);
          break;
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [refreshData, exportSnapshot, closeView, setSelectedTab]);
```

### 9.2 Screen Reader Support

**ARIA Attributes:**

```typescript
// Header
<header role="banner" aria-label="User detail header">
  <h1 id="user-detail-title">{userDetail?.user.displayName}</h1>
  <div role="toolbar" aria-label="User actions">
    <Button aria-label="Refresh user data">Refresh</Button>
    <Button aria-label="Add user to migration wave">Add to Wave</Button>
    <Button aria-label="Export user snapshot">Export</Button>
    <Button aria-label="Close user detail view">Close</Button>
  </div>
</header>

// Tab Control
<div role="tablist" aria-label="User detail sections">
  {TAB_CONFIG.map((tab, index) => (
    <button
      key={index}
      role="tab"
      aria-selected={selectedTab === index}
      aria-controls={`tab-panel-${index}`}
      id={`tab-${index}`}
      onClick={() => setSelectedTab(index)}
    >
      {tab.label}
    </button>
  ))}
</div>

<div
  role="tabpanel"
  id={`tab-panel-${selectedTab}`}
  aria-labelledby={`tab-${selectedTab}`}
>
  {renderTabContent(selectedTab, userDetail)}
</div>
```

### 9.3 Focus Management

```typescript
// Focus first focusable element when view opens
useEffect(() => {
  const firstButton = document.querySelector<HTMLButtonElement>('button[aria-label="Refresh user data"]');
  firstButton?.focus();
}, []);

// Focus management for tab switching
const setSelectedTab = (index: number) => {
  setSelectedTabInternal(index);

  // Focus the tab panel content
  const tabPanel = document.getElementById(`tab-panel-${index}`);
  tabPanel?.focus();
};
```

---

## 10. Error Handling & Edge Cases

### 10.1 Error Scenarios

**1. User Not Found:**
```typescript
if (!result) {
  throw new Error('User not found in LogicEngine data');
}
```
**UI:** Display error card with "Retry" button.

**2. LogicEngine Not Loaded:**
```typescript
if (!logicEngine.isLoaded()) {
  await logicEngine.loadAllAsync();
}
```
**UI:** Show loading overlay with "Loading discovery data..." message.

**3. Network/IPC Failure:**
```typescript
catch (err: any) {
  if (err.code === 'IPC_TIMEOUT') {
    setError('Request timed out. The system may be under heavy load.');
  } else {
    setError('Failed to load user details. Please try again.');
  }
}
```

**4. Partial Data:**
```typescript
// Handle missing optional data gracefully
const mailbox = userDetail.mailbox || null;

// In MailboxTab
if (!mailbox) {
  return <p>No mailbox data available for this user.</p>;
}
```

**5. Empty Collections:**
```typescript
// In GroupsTab
if (groups.length === 0) {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-600">This user is not a member of any groups.</p>
    </div>
  );
}
```

### 10.2 Loading States

**Multi-Stage Loading:**

```typescript
// Stage 1: Initializing
setLoadingMessage('Initializing...');

// Stage 2: Checking Cache
setLoadingMessage('Checking cached data...');

// Stage 3: Loading from LogicEngine
setLoadingMessage('Loading user data from LogicEngine...');

// Stage 4: Correlating Entities
setLoadingMessage('Correlating groups, devices, and applications...');

// Stage 5: Complete
setLoadingMessage('');
setIsLoading(false);
```

### 10.3 Retry Logic

```typescript
const loadUserDetail = async (retryCount = 0) => {
  try {
    // ... load logic ...
  } catch (err) {
    if (retryCount < 3) {
      console.warn(`Load failed, retrying... (${retryCount + 1}/3)`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return loadUserDetail(retryCount + 1);
    } else {
      setError('Failed to load user details after 3 attempts.');
    }
  }
};
```

---

## 11. Testing Strategy

### 11.1 Unit Tests

**useUserDetailLogic.test.ts:**
- Test loadUserDetail with valid userId
- Test loadUserDetail with invalid userId
- Test refreshData clears cache and reloads
- Test addToMigrationWave opens modal
- Test exportSnapshot generates correct file
- Test closeView closes tab

**UserDetailView.test.tsx:**
- Test component renders with loading state
- Test component renders with error state
- Test component renders with valid data
- Test tab switching updates selected tab
- Test action buttons call correct handlers
- Test keyboard shortcuts trigger actions

### 11.2 Integration Tests

**End-to-End Test:**
1. Open UsersView
2. Click "View Details" on a user row
3. Verify new tab opens with UserDetailView
4. Verify user summary card displays correct data
5. Verify all 9 tabs render correctly
6. Click "Add to Wave" button
7. Verify MigrationWaveDialog opens
8. Click "Export" button
9. Verify file download initiates
10. Click "Close" button
11. Verify tab closes

### 11.3 Performance Tests

**Load Time Test:**
```typescript
test('UserDetailView loads in < 500ms', async () => {
  const startTime = performance.now();
  render(<UserDetailView userId="test-user-123" />);
  await waitFor(() => expect(screen.getByText(/Ready/)).toBeInTheDocument());
  const loadTime = performance.now() - startTime;
  expect(loadTime).toBeLessThan(500);
});
```

**Memory Leak Test:**
```typescript
test('UserDetailView cleans up resources on unmount', () => {
  const { unmount } = render(<UserDetailView userId="test-user-123" />);
  const initialMemory = performance.memory.usedJSHeapSize;
  unmount();
  const finalMemory = performance.memory.usedJSHeapSize;
  expect(finalMemory).toBeLessThanOrEqual(initialMemory * 1.1); // Allow 10% margin
});
```

---

## 12. Deployment & Build Considerations

### 12.1 Build Process

**No changes required** to existing `buildguiv2.ps1` script. The UserDetailView component will be automatically included in the Webpack bundle.

### 12.2 Code Splitting

**Optimize bundle size by lazy-loading tab components:**

```typescript
// Instead of importing all tab components upfront, lazy-load them
const OverviewTab = React.lazy(() => import('./tabs/OverviewTab'));
const DevicesTab = React.lazy(() => import('./tabs/DevicesTab'));
// ... etc.

function renderTabContent(tabIndex: number, userDetail: UserDetailProjection): React.ReactNode {
  return (
    <React.Suspense fallback={<div>Loading tab...</div>}>
      {tabIndex === 0 && <OverviewTab userDetail={userDetail} />}
      {tabIndex === 1 && <DevicesTab devices={userDetail.devices} />}
      {/* ... etc. */}
    </React.Suspense>
  );
}
```

**Impact:** Reduces initial bundle size by ~50KB (each tab component is ~5-10KB).

---

## 13. Security Considerations

### 13.1 Data Sanitization

**Prevent XSS attacks:**

```typescript
// Never use dangerouslySetInnerHTML for user-provided data
// Always use React's automatic escaping

// BAD:
<div dangerouslySetInnerHTML={{ __html: userDetail.user.displayName }} />

// GOOD:
<div>{userDetail.user.displayName}</div>
```

### 13.2 IPC Security

**Validate all IPC inputs:**

```typescript
ipcMain.handle('get-user-detail', async (event, args: { userId: string }) => {
  // Validate userId format (SID or UPN)
  if (!args.userId || typeof args.userId !== 'string') {
    throw new Error('Invalid userId parameter');
  }

  // Sanitize input (prevent path traversal, SQL injection, etc.)
  const sanitizedUserId = args.userId.trim();

  // ... proceed with load ...
});
```

### 13.3 File Export Security

**Prevent directory traversal:**

```typescript
const exportPath = path.join(app.getPath('downloads'), path.basename(fileName));
// path.basename ensures fileName cannot contain '../' or absolute paths
```

---

## 14. Documentation & Handoff

### 14.1 Code Comments

**Every function must have JSDoc comments:**

```typescript
/**
 * Load user detail from LogicEngineService via IPC
 *
 * Workflow:
 * 1. Validate userId parameter
 * 2. Call 'get-user-detail' IPC handler
 * 3. Update state with returned UserDetailProjection
 * 4. Show success/error notification
 *
 * @throws Error if userId is invalid or user not found
 * @fires showNotification - On success or error
 */
const loadUserDetail = async () => { /* ... */ };
```

### 14.2 README Addition

**Add to guiv2/README.md:**

```markdown
## UserDetailView Component

### Overview
The UserDetailView provides comprehensive user analysis with 9 tabs of correlated data.

### Usage
```typescript
import { UserDetailView } from './views/users/UserDetailView';

<UserDetailView userId="user@company.com" />
```

### Features
- User summary card (User Info, Organization, Account Status)
- 9 data tabs (Overview, Devices, Apps, Groups, GPOs, File Access, Mailbox, Azure Roles, SQL & Risks)
- Actions: Refresh, Add to Wave, Export, Close
- Full keyboard navigation (Ctrl+R, Ctrl+E, Ctrl+W, Ctrl+1-9)
- Screen reader support (ARIA labels)

### Dependencies
- LogicEngineService (Epic 4)
- TabStore, ModalStore, MigrationStore, NotificationStore
- DataGridWrapper, ModernCard, Button, LoadingOverlay components

### Performance
- Sub-500ms load time with caching
- 60fps grid rendering with virtualization
- < 50MB memory usage per instance
```

### 14.3 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          UserDetailView                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Header: Title, Subtitle, Actions (Refresh, Add, Export, Close) │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  User Summary Card (3 columns)                              │   │
│  │  ┌──────────┬──────────┬──────────┐                        │   │
│  │  │ User Info│Organization│Account  │                        │   │
│  │  └──────────┴──────────┴──────────┘                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Tab Control (9 tabs)                                       │   │
│  │  [Overview][Devices][Apps][Groups][GPOs][File][Mail][Azure][SQL]│
│  │  ┌─────────────────────────────────────────────────────────┐   │
│  │  │                                                           │   │
│  │  │  Tab Content (DataGridWrapper or Custom Component)       │   │
│  │  │                                                           │   │
│  │  └─────────────────────────────────────────────────────────┘   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Status Bar: "Ready" / "Loading..." / "Error: ..."         │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  ▲
                                  │
                                  │ IPC: get-user-detail
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      LogicEngineService (Main Process)              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  buildUserDetailProjection(userId)                          │   │
│  │  1. Find user by SID/UPN                                    │   │
│  │  2. Correlate groups (index: groupsByUserSid)               │   │
│  │  3. Correlate devices (index: devicesByPrimaryUserSid)      │   │
│  │  4. Correlate apps (index: appsByDevice)                    │   │
│  │  5. Correlate drives (index: drivesByUserSid)               │   │
│  │  6. Correlate file access (index: aclByIdentitySid)         │   │
│  │  7. Correlate GPOs (logic: getApplicableGpos)               │   │
│  │  8. Get mailbox (index: mailboxByUpn)                       │   │
│  │  9. Get Azure roles (index: rolesByPrincipalId)             │   │
│  │  10. Get SQL databases (correlation logic)                  │   │
│  │  11. Calculate risks (logic: calculateEntityRisks)          │   │
│  │  12. Generate migration hints                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Data Stores:                                                       │
│  - usersBySid: Map<string, UserDto>                                │
│  - groupsBySid: Map<string, GroupDto>                              │
│  - devicesByPrimaryUserSid: Map<string, DeviceDto[]>               │
│  - appsByDevice: Map<string, AppDto[]>                             │
│  - ... (13+ indices)                                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 15. Implementation Checklist

### Phase 1: Type Definitions & Models (2 hours)
- [ ] Create/enhance `UserDetailProjection` interface in `user.ts`
- [ ] Create `RiskItem`, `MigrationHint`, `MappedDriveData` interfaces
- [ ] Create `FileAccessEntry`, `GpoData`, `MailboxData` interfaces
- [ ] Create `AzureRoleAssignment`, `SqlDatabaseData` interfaces
- [ ] Enhance `DeviceData`, `ApplicationData`, `GroupData` interfaces (if needed)

### Phase 2: IPC Handlers (3 hours)
- [ ] Implement `get-user-detail` IPC handler in `ipcHandlers.ts`
- [ ] Implement `clear-user-detail-cache` IPC handler
- [ ] Implement `export-user-snapshot` IPC handler
- [ ] Add handlers to preload script
- [ ] Update TypeScript declarations (`electron.d.ts`)
- [ ] Test IPC handlers with mock data

### Phase 3: Business Logic Hook (4 hours)
- [ ] Create `useUserDetailLogic.ts` hook
- [ ] Implement `loadUserDetail` function
- [ ] Implement `refreshData` function
- [ ] Implement `addToMigrationWave` function
- [ ] Implement `exportSnapshot` function
- [ ] Implement `closeView` function
- [ ] Add error handling and retry logic
- [ ] Add loading state management
- [ ] Test hook with mock data

### Phase 4: Component Implementation (6 hours)
- [ ] Create `UserDetailView.tsx` main component
- [ ] Implement header section with action buttons
- [ ] Implement user summary card (3-column layout)
- [ ] Implement loading overlay integration
- [ ] Implement tab control (9 tabs)
- [ ] Implement `OverviewTab` component
- [ ] Implement `DevicesTab` component
- [ ] Implement `AppsTab` component
- [ ] Implement `GroupsTab` component
- [ ] Implement `GposTab` component (split view)
- [ ] Implement `FileAccessTab` component
- [ ] Implement `MailboxTab` component
- [ ] Implement `AzureRolesTab` component
- [ ] Implement `SqlRisksTab` component (split view)
- [ ] Implement status bar
- [ ] Test component rendering with mock data

### Phase 5: Integration (3 hours)
- [ ] Enhance `UsersView.tsx` with "View Details" action
- [ ] Update `TabView.tsx` dynamic import registry
- [ ] Test tab navigation flow (UsersView → UserDetailView)
- [ ] Test tab closing behavior
- [ ] Test multiple concurrent user detail tabs
- [ ] Test browser navigation (back/forward)

### Phase 6: Accessibility & UX (2 hours)
- [ ] Add keyboard shortcuts (Ctrl+R, Ctrl+E, Ctrl+W, Ctrl+1-9)
- [ ] Add ARIA labels and roles
- [ ] Implement focus management
- [ ] Test with keyboard-only navigation
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Add tooltips to all buttons
- [ ] Ensure color contrast meets WCAG AA standards

### Phase 7: Performance Optimization (2 hours)
- [ ] Add React.memo to tab components
- [ ] Add useMemo for column definitions
- [ ] Implement lazy tab loading (data fetched on tab switch)
- [ ] Add performance telemetry
- [ ] Test with large datasets (1000+ rows per tab)
- [ ] Verify 60fps scrolling performance
- [ ] Measure memory usage and optimize if needed

### Phase 8: Testing (4 hours)
- [ ] Write unit tests for `useUserDetailLogic`
- [ ] Write component tests for `UserDetailView`
- [ ] Write integration tests (end-to-end flow)
- [ ] Write performance tests (load time, memory)
- [ ] Test error scenarios (user not found, network failure)
- [ ] Test edge cases (empty data, partial data)
- [ ] Test on Windows/Mac/Linux
- [ ] Test in light and dark themes

### Phase 9: Documentation & Handoff (2 hours)
- [ ] Add JSDoc comments to all functions
- [ ] Update guiv2/README.md with UserDetailView section
- [ ] Create inline code examples
- [ ] Document keyboard shortcuts
- [ ] Document IPC API
- [ ] Create architecture diagram
- [ ] Create user guide (how to use UserDetailView)
- [ ] Prepare handoff notes for gui-module-executor

---

## 16. Risks & Mitigation

### Risk 1: Logic Engine Service Not Complete (CRITICAL)
**Impact:** UserDetailView cannot function without data correlation logic.
**Probability:** Medium (Epic 4 dependency)
**Mitigation:**
- Implement **mock LogicEngineService** for development/testing
- Define clear interface contract (section 7.1)
- Coordinate with Epic 4 team on timeline
- Use mock data in IPC handlers until Epic 4 completes

**Mock Implementation:**
```typescript
// guiv2/src/main/services/mockLogicEngineService.ts
export class MockLogicEngineService {
  public async getUserDetailAsync(userId: string): Promise<UserDetailProjection> {
    return {
      user: {
        id: userId,
        displayName: 'Mock User',
        userPrincipalName: 'mock@company.com',
        // ... full mock user data ...
      },
      groups: [/* mock groups */],
      devices: [/* mock devices */],
      apps: [/* mock apps */],
      // ... full mock correlated data ...
    };
  }
}
```

### Risk 2: Performance Degradation with Large Datasets
**Impact:** Slow rendering, high memory usage, poor UX.
**Probability:** Low (AG Grid virtualization handles this well)
**Mitigation:**
- Use AG Grid's built-in virtualization (already implemented)
- Lazy-load tab data (only fetch when tab is selected)
- Implement pagination for tabs with 1000+ rows
- Add loading indicators for slow operations
- Profile and optimize hotspots

### Risk 3: Browser Compatibility Issues
**Impact:** UI breakage in certain browsers.
**Probability:** Very Low (Electron uses Chromium, consistent environment)
**Mitigation:**
- Test in latest Electron version
- Use standard CSS (avoid experimental features)
- Use Babel for JavaScript transpilation
- Test on Windows/Mac/Linux

### Risk 4: Data Correlation Errors
**Impact:** Incorrect data displayed (e.g., wrong groups, devices, permissions).
**Probability:** Medium (complex correlation logic)
**Mitigation:**
- **Comprehensive unit tests** for LogicEngineService correlation logic
- **Integration tests** with real CSV data
- **Manual QA** with known-good test data
- **Audit logging** of all correlation decisions
- **User reporting** mechanism for data issues

---

## 17. Success Criteria

### Functional Requirements
- [ ] UserDetailView renders 9 tabs with correct data
- [ ] All action buttons work (Refresh, Add to Wave, Export, Close)
- [ ] Tab switching is smooth and responsive
- [ ] Data grids display correct columns and values
- [ ] Error states are handled gracefully
- [ ] Loading states provide clear feedback

### Non-Functional Requirements
- [ ] Load time < 500ms (with caching)
- [ ] Grid rendering at 60fps
- [ ] Memory usage < 50MB per instance
- [ ] Full keyboard navigation support
- [ ] Screen reader compatibility
- [ ] WCAG AA color contrast compliance

### Integration Requirements
- [ ] Opens from UsersView "View Details" action
- [ ] Integrates with TabStore for tab management
- [ ] Integrates with ModalStore for dialogs
- [ ] Integrates with MigrationStore for wave assignment
- [ ] Integrates with NotificationStore for feedback

### Quality Requirements
- [ ] 100% TypeScript type coverage
- [ ] 80%+ unit test coverage
- [ ] All integration tests pass
- [ ] No console errors or warnings
- [ ] No memory leaks
- [ ] Passes accessibility audit

---

## 18. Handoff to gui-module-executor

### Context
You are implementing **Epic 1, Task 1.2: UserDetailView Component** as defined in `CLAUDE.md`. This is a critical feature that provides deep-drill user analysis by correlating data from multiple discovery modules.

### Architecture Overview
- **Main Component:** `UserDetailView.tsx` (single file, ~800 lines)
- **Business Logic:** `useUserDetailLogic.ts` hook (state management, IPC calls)
- **Data Models:** Enhanced type definitions in `user.ts` and related model files
- **IPC Integration:** 3 new handlers (`get-user-detail`, `clear-user-detail-cache`, `export-user-snapshot`)
- **Dependencies:** LogicEngineService (Epic 4, use mock for now), TabStore, ModalStore, MigrationStore

### Key Design Decisions
1. **9-Tab Structure:** Replicate exact WPF layout (Overview, Devices, Apps, Groups, GPOs, File Access, Mailbox, Azure Roles, SQL & Risks)
2. **Single File Component:** All tab components in one file for simplicity (can be split later if needed)
3. **Lazy Data Loading:** Only fetch data when tab is first selected (optimize performance)
4. **AG Grid Reuse:** Use existing `DataGridWrapper` for all data tables
5. **Mock Data Initially:** Use mock LogicEngineService until Epic 4 completes

### Implementation Order
1. **Start with Type Definitions** (Section 2) - Foundation for everything else
2. **Implement IPC Handlers** (Section 5) - Use mock data for now
3. **Create Business Logic Hook** (Section 3) - Core state management
4. **Build Component UI** (Section 4) - Main view with all 9 tabs
5. **Integrate with UsersView** (Section 6.1) - Add "View Details" action
6. **Add Accessibility** (Section 9) - Keyboard shortcuts, ARIA labels
7. **Optimize Performance** (Section 8) - Memoization, lazy loading
8. **Write Tests** (Section 11) - Unit, integration, performance tests

### Critical Path Items
- **UserDetailProjection Interface** - Must match C# model exactly for future Epic 4 integration
- **IPC Handler Signatures** - Must match contract defined in section 5.1
- **Tab Rendering Logic** - Must handle empty data, loading states, errors gracefully

### Testing Strategy
- Use **mock data** for all tests initially
- Create **realistic mock data** that resembles production CSV data
- Test **all 9 tabs** with varying data sizes (0 rows, 1 row, 100 rows, 1000 rows)
- Test **all error scenarios** (user not found, network failure, partial data)

### Reference Files
- **Original WPF:** `D:\Scripts\UserMandA\GUI\Views\UserDetailView.xaml` (lines 1-539)
- **Original ViewModel:** `D:\Scripts\UserMandA\GUI\ViewModels\UserDetailViewModel.cs` (lines 16-197)
- **Logic Engine:** `D:\Scripts\UserMandA\GUI\Services\LogicEngineService.cs` (lines 204-260 for correlation logic)
- **Working Pattern:** `guiv2/src/renderer/views/users/UsersView.tsx` (reference for data loading)

### Questions to Ask
1. Should tab components be split into separate files or kept in one file?
2. Should we implement pagination for large datasets (1000+ rows) or rely on virtualization?
3. Should we add a "Recently Viewed Users" feature to TabStore?
4. Should export support multiple formats (CSV, JSON, Excel) or just JSON initially?

### Success Indicators
- UsersView "View Details" action opens new tab with UserDetailView
- All 9 tabs render correctly with mock data
- All action buttons work (Refresh, Add to Wave, Export, Close)
- Keyboard shortcuts work (Ctrl+R, Ctrl+E, Ctrl+W, Ctrl+1-9)
- No console errors or TypeScript warnings
- Load time < 500ms, 60fps scrolling

### Next Steps After Completion
1. Update `CLAUDE.md` with UserDetailView completion status
2. Create handoff document for Epic 4 team (LogicEngineService interface requirements)
3. Begin Epic 1 Task 1.3: ComputerDetailView (similar architecture)
4. Plan for AssetDetailView, GroupDetailView (similar patterns)

---

**END OF ARCHITECTURE DOCUMENT**

**Total Estimated Implementation Time:** 28 hours (3.5 days at 8 hours/day)

**Document Prepared By:** Ultra-Autonomous Senior Technical Architecture Lead
**Date:** October 4, 2025
**Version:** 1.0
**Status:** Ready for Implementation
