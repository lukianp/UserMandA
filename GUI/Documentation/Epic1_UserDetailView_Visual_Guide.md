# Epic 1 Task 1.2: UserDetailView - Visual Architecture Guide

**Document Version:** 1.0
**Date:** October 4, 2025

---

## Component Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ UserDetailView Component                                                    │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ HEADER                                                                  │ │
│ │ ┌────────────────────────────────┐  ┌────────────────────────────────┐ │ │
│ │ │ John Smith                     │  │ [🔄 Refresh] [➕ Add to Wave] │ │ │
│ │ │ Comprehensive user information │  │ [💾 Export]  [❌ Close]       │ │ │
│ │ └────────────────────────────────┘  └────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ USER SUMMARY CARD                                                       │ │
│ │ ┌──────────────────┬──────────────────┬──────────────────┐             │ │
│ │ │ 👤 USER INFO     │ 🏢 ORGANIZATION  │ 📅 ACCOUNT STATUS│             │ │
│ │ ├──────────────────┼──────────────────┼──────────────────┤             │ │
│ │ │ Display Name:    │ Department:      │ Status: Enabled  │             │ │
│ │ │ John Smith       │ IT Operations    │                  │             │ │
│ │ │                  │                  │ Created:         │             │ │
│ │ │ UPN:             │ Job Title:       │ 2020-01-15       │             │ │
│ │ │ jsmith@corp.com  │ Senior Engineer  │                  │             │ │
│ │ │                  │                  │ Last Sign-In:    │             │ │
│ │ │ Email:           │ Manager:         │ 2025-10-04 09:23 │             │ │
│ │ │ jsmith@corp.com  │ Alice Johnson    │                  │             │ │
│ │ └──────────────────┴──────────────────┴──────────────────┘             │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ TAB CONTROL                                                             │ │
│ │ ┌───────┬─────────┬──────┬────────┬──────┬──────────┬─────────┬───────┐│ │
│ │ │📊 Over│🖥️ Device│📱 App│👥 Group│🛡️ GPO│📁 File   │📧 Mailbox│☁️ Azure││ │
│ │ │  view │   s     │  s   │  s     │  s   │  Access  │         │ Roles ││ │
│ │ └───────┴─────────┴──────┴────────┴──────┴──────────┴─────────┴───────┘│ │
│ │                                                                         │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ TAB CONTENT AREA                                                    │ │ │
│ │ │                                                                     │ │ │
│ │ │ [Tab-specific content renders here based on selected tab]          │ │ │
│ │ │                                                                     │ │ │
│ │ │ - Overview: Resource/Services summary cards                        │ │ │
│ │ │ - Devices/Apps/Groups/etc: DataGridWrapper with columns            │ │ │
│ │ │ - Mailbox: Card layout with mailbox details                        │ │ │
│ │ │ - Split tabs (GPOs, SQL & Risks): Two grids side-by-side           │ │ │
│ │ │                                                                     │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ STATUS BAR                                                              │ │
│ │ Ready | Loaded 234 items in 312ms                                      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tab Content Examples

### Tab 1: Overview

```
┌─────────────────────────────────────────────────────────────┐
│ User Overview Summary                                       │
│                                                             │
│ ┌──────────────────────────┬──────────────────────────┐    │
│ │ Resource Summary         │ Services Summary         │    │
│ │                          │                          │    │
│ │ Groups: 12               │ Mapped Drives: 3         │    │
│ │ Devices: 2               │ Azure Roles: 1           │    │
│ │ Applications: 45         │ SQL Databases: 2         │    │
│ │ File Access Entries: 87  │ Risk Items: 0            │    │
│ └──────────────────────────┴──────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Tab 2: Devices

```
┌─────────────────────────────────────────────────────────────┐
│ Devices DataGrid                                            │
├──────────────┬──────────────┬────────┬──────────┬──────────┤
│ Device Name  │ DNS Name     │ OS     │ OU       │ Primary  │
├──────────────┼──────────────┼────────┼──────────┼──────────┤
│ DESKTOP-001  │ d001.corp... │ Win 11 │ Corp/IT  │ jsmith   │
│ LAPTOP-123   │ l123.corp... │ Win 11 │ Corp/IT  │ jsmith   │
├──────────────┼──────────────┼────────┼──────────┼──────────┤
│ 2 devices                                                   │
└─────────────────────────────────────────────────────────────┘
```

### Tab 5: GPOs (Split View)

```
┌─────────────────────────────────────────────────────────────┐
│ GPO Links                                                   │
├──────────────────────┬─────────────────────┬────────────────┤
│ GPO Name             │ GUID                │ Enabled        │
├──────────────────────┼─────────────────────┼────────────────┤
│ Default Domain Policy│ {31B2F340-016D...} │ ✓              │
│ IT Security Policy   │ {A2F34B01-782A...} │ ✓              │
├──────────────────────┴─────────────────────┴────────────────┤
│                                                             │
│ GPO Security Filters                                        │
├──────────────────────┬─────────────────────┬────────────────┤
│ GPO Name             │ GUID                │ WMI Filter     │
├──────────────────────┼─────────────────────┼────────────────┤
│ Workstation Policy   │ {B3E45C12-893B...} │ None           │
└─────────────────────────────────────────────────────────────┘
```

### Tab 7: Mailbox (Card Layout)

```
┌─────────────────────────────────────────────────────────────┐
│ Mailbox Information                                         │
│                                                             │
│ Mailbox GUID:  a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d        │
│ Size (MB):     4,523                                        │
│ Type:          UserMailbox                                  │
│ Item Count:    12,345                                       │
│ Database:      MBX-DB-01                                    │
└─────────────────────────────────────────────────────────────┘
```

### Tab 9: SQL & Risks (Split View)

```
┌─────────────────────────────────────────────────────────────┐
│ SQL Databases                                               │
├──────────────┬──────────┬──────────┬────────────────────────┤
│ Server       │ Instance │ Database │ App Hints              │
├──────────────┼──────────┼──────────┼────────────────────────┤
│ SQL-PROD-01  │ Default  │ CRM_DB   │ SalesApp, ReportEngine │
│ SQL-PROD-02  │ HR       │ HRIS_DB  │ PayrollSystem          │
├──────────────┴──────────┴──────────┴────────────────────────┤
│                                                             │
│ Risk Assessment                                             │
├───────────────────┬──────────┬──────────────┬──────────────┤
│ Risk Type         │ Severity │ Description  │ Recommendat..│
├───────────────────┼──────────┼──────────────┼──────────────┤
│ StaleAccount      │ Medium   │ No sign-in   │ Review acct  │
│ OverprivilegedApp │ High     │ Admin on SQL │ Remove privs │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          RENDERER PROCESS                           │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ UsersView.tsx                                                 │ │
│  │                                                               │ │
│  │ User clicks "View Details" on row                             │ │
│  │    ↓                                                          │ │
│  │ useTabStore.openTab({                                         │ │
│  │   title: "User: John Smith",                                  │ │
│  │   component: 'UserDetailView',                                │ │
│  │   data: { userId: 'jsmith@corp.com' }                         │ │
│  │ })                                                            │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                           ↓                                         │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ TabView.tsx                                                   │ │
│  │                                                               │ │
│  │ Renders new tab with UserDetailView component                 │ │
│  │    ↓                                                          │ │
│  │ <UserDetailView userId="jsmith@corp.com" />                   │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                           ↓                                         │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ UserDetailView.tsx                                            │ │
│  │                                                               │ │
│  │ const { userDetail, isLoading, error, ... } =                 │ │
│  │   useUserDetailLogic('jsmith@corp.com')                       │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                           ↓                                         │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ useUserDetailLogic.ts                                         │ │
│  │                                                               │ │
│  │ useEffect(() => {                                             │ │
│  │   loadUserDetail()  ← Calls on mount                          │ │
│  │ }, [userId])                                                  │ │
│  │                                                               │ │
│  │ const loadUserDetail = async () => {                          │ │
│  │   setIsLoading(true)                                          │ │
│  │   setLoadingMessage('Loading user data...')                   │ │
│  │                                                               │ │
│  │   const result = await window.electron.invoke(                │ │
│  │     'get-user-detail',                                        │ │
│  │     { userId: 'jsmith@corp.com' }                             │ │
│  │   )                   ← IPC CALL                              │ │
│  │                                                               │ │
│  │   setUserDetail(result)                                       │ │
│  │   setIsLoading(false)                                         │ │
│  │ }                                                             │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                           ↓                                         │
│                    IPC BRIDGE (preload.ts)                          │
└─────────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                          MAIN PROCESS                               │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ipcHandlers.ts                                                │ │
│  │                                                               │ │
│  │ ipcMain.handle('get-user-detail', async (event, args) => {    │ │
│  │   const { userId } = args                                     │ │
│  │                                                               │ │
│  │   // Get singleton LogicEngineService instance                │ │
│  │   const logicEngine = LogicEngineService.getInstance()        │ │
│  │                                                               │ │
│  │   // Ensure data is loaded                                    │ │
│  │   if (!logicEngine.isLoaded()) {                              │ │
│  │     await logicEngine.loadAllAsync()  ← Load CSV data         │ │
│  │   }                                                           │ │
│  │                                                               │ │
│  │   // Get user detail projection                               │ │
│  │   const userDetail = await logicEngine.getUserDetailAsync(    │ │
│  │     userId                                                    │ │
│  │   )                   ← CORRELATION LOGIC                     │ │
│  │                                                               │ │
│  │   return { success: true, data: userDetail }                  │ │
│  │ })                                                            │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                           ↓                                         │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ LogicEngineService.ts (Epic 4)                                │ │
│  │                                                               │ │
│  │ async getUserDetailAsync(userId: string) {                    │ │
│  │   return this.buildUserDetailProjection(userId)               │ │
│  │ }                                                             │ │
│  │                                                               │ │
│  │ buildUserDetailProjection(userId: string) {                   │ │
│  │   // 1. Find user by SID or UPN                               │ │
│  │   const user = this.usersBySid.get(userId) ||                 │ │
│  │                this.usersByUpn.get(userId)                     │ │
│  │                                                               │ │
│  │   // 2. Correlate groups (via groupsByUserSid index)          │ │
│  │   const groups = this.getGroupsForUser(user.sid)              │ │
│  │                                                               │ │
│  │   // 3. Correlate devices (via devicesByPrimaryUserSid)       │ │
│  │   const devices = this.getDevicesForUser(user.sid)            │ │
│  │                                                               │ │
│  │   // 4. Correlate apps (multi-hop: user → devices → apps)     │ │
│  │   const apps = devices.flatMap(d =>                           │ │
│  │     this.appsByDevice.get(d.name) || []                       │ │
│  │   )                                                           │ │
│  │                                                               │ │
│  │   // 5-11. Correlate drives, file access, GPOs, mailbox,      │ │
│  │   //         Azure roles, SQL, risks, migration hints         │ │
│  │   // ... (detailed correlation logic) ...                     │ │
│  │                                                               │ │
│  │   return {                                                    │ │
│  │     user, groups, devices, apps, drives, fileAccess,          │ │
│  │     gpoLinks, gpoFilters, mailbox, azureRoles,                │ │
│  │     sqlDatabases, risks, migrationHints,                      │ │
│  │     memberOfGroups, managedGroups, managerUpn, ownedGroups    │ │
│  │   }                                                           │ │
│  │ }                                                             │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                           ↑                                         │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Data Sources (loaded on startup)                             │ │
│  │                                                               │ │
│  │ CSV Files:                                                    │ │
│  │ - C:\discoverydata\ProfileName\Raw\Users.csv                  │ │
│  │ - C:\discoverydata\ProfileName\Raw\Groups.csv                 │ │
│  │ - C:\discoverydata\ProfileName\Raw\Devices.csv                │ │
│  │ - C:\discoverydata\ProfileName\Raw\Applications.csv           │ │
│  │ - C:\discoverydata\ProfileName\Raw\ACLs.csv                   │ │
│  │ - C:\discoverydata\ProfileName\Raw\GPOs.csv                   │ │
│  │ - C:\discoverydata\ProfileName\Raw\Mailboxes.csv              │ │
│  │ - C:\discoverydata\ProfileName\Raw\AzureRoles.csv             │ │
│  │ - C:\discoverydata\ProfileName\Raw\SqlDatabases.csv           │ │
│  │                                                               │ │
│  │ In-Memory Indices (for fast correlation):                     │ │
│  │ - usersBySid: Map<string, UserDto>                            │ │
│  │ - usersByUpn: Map<string, UserDto>                            │ │
│  │ - groupsByUserSid: Map<string, GroupDto[]>                    │ │
│  │ - devicesByPrimaryUserSid: Map<string, DeviceDto[]>           │ │
│  │ - appsByDevice: Map<string, AppDto[]>                         │ │
│  │ - aclByIdentitySid: Map<string, AclEntry[]>                   │ │
│  │ - mailboxByUpn: Map<string, MailboxDto>                       │ │
│  │ - rolesByPrincipalId: Map<string, AzureRoleAssignment[]>      │ │
│  │ - ... (13+ indices total)                                     │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## State Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│ useUserDetailLogic Hook State Machine                       │
│                                                              │
│     ┌──────────┐                                            │
│     │ INITIAL  │                                            │
│     └────┬─────┘                                            │
│          │                                                  │
│          │ useEffect triggers loadUserDetail()              │
│          ↓                                                  │
│     ┌──────────┐                                            │
│     │ LOADING  │ ← setIsLoading(true)                       │
│     │          │   setLoadingMessage('Loading...')          │
│     └────┬─────┘                                            │
│          │                                                  │
│          │ IPC call: get-user-detail                        │
│          │                                                  │
│          ├─────────── Success ──────────┐                   │
│          │                              │                   │
│          ↓                              ↓                   │
│     ┌──────────┐                   ┌─────────┐             │
│     │  LOADED  │ ← setUserDetail() │  ERROR  │             │
│     │          │   setIsLoading()  │         │             │
│     └────┬─────┘   false           └────┬────┘             │
│          │                               │                  │
│          │                               │                  │
│          │ User actions:                 │                  │
│          │ - refreshData()               │ User actions:    │
│          │ - addToMigrationWave()        │ - refreshData()  │
│          │ - exportSnapshot()            │                  │
│          │ - closeView()                 │                  │
│          │                               │                  │
│          └───────────────────────────────┘                  │
│                      ↓                                      │
│          Back to LOADING or EXIT                            │
└──────────────────────────────────────────────────────────────┘

State Variables:
- userDetail: UserDetailProjection | null
- isLoading: boolean
- error: string | null
- loadingMessage: string
- selectedTab: number (0-8)

Actions:
- loadUserDetail(): Fetch data from IPC
- refreshData(): Clear cache, reload
- addToMigrationWave(): Open modal, add to wave
- exportSnapshot(format): Save to Downloads
- closeView(): Close current tab
- setSelectedTab(index): Switch active tab
```

---

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    UserDetailView Ecosystem                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ UserDetailView.tsx                                         │ │
│  │                                                            │ │
│  │ Props:                                                     │ │
│  │ - userId: string (from tab.data)                           │ │
│  │                                                            │ │
│  │ Uses:                                                      │ │
│  │ - useUserDetailLogic(userId) ──────────┐                  │ │
│  │ - Button component                     │                  │ │
│  │ - ModernCard component                 │                  │ │
│  │ - LoadingOverlay component             │                  │ │
│  │ - DataGridWrapper component            │                  │ │
│  └────────────────────────────────────────┼─────────────────┘ │
│                                           │                    │
│  ┌────────────────────────────────────────▼─────────────────┐ │
│  │ useUserDetailLogic.ts                                    │ │
│  │                                                          │ │
│  │ Manages:                                                 │ │
│  │ - Data loading state (loading, error, data)              │ │
│  │ - User actions (refresh, export, add to wave, close)     │ │
│  │ - Tab selection                                          │ │
│  │                                                          │ │
│  │ Calls:                                                   │ │
│  │ - window.electron.invoke('get-user-detail') ────┐        │ │
│  │ - useTabStore.closeTab() ──────────────────┐    │        │ │
│  │ - useModalStore.openModal() ───────────┐   │    │        │ │
│  │ - useMigrationStore.addItemToWave() ─┐ │   │    │        │ │
│  │ - useNotificationStore.showNotification() │ │   │    │    │ │
│  └──────────────────────────────────────┼───┼───┼───┼────┘ │
│                                         │   │   │   │      │
│  ┌──────────────────────────────────────┼───┼───┼───▼────┐ │
│  │ Zustand Stores                       │   │   │        │ │
│  │                                      │   │   │        │ │
│  │ - useTabStore ◀──────────────────────┼───┼───┘        │ │
│  │   • openTab()                        │   │            │ │
│  │   • closeTab()                       │   │            │ │
│  │                                      │   │            │ │
│  │ - useModalStore ◀────────────────────┼───┘            │ │
│  │   • openModal()                      │                │ │
│  │                                      │                │ │
│  │ - useMigrationStore ◀────────────────┘                │ │
│  │   • addItemToWave()                                   │ │
│  │                                                       │ │
│  │ - useNotificationStore                                │ │
│  │   • showNotification()                                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ IPC Handlers (Main Process)                          │ │
│  │                                                      │ │
│  │ - get-user-detail ────────────┐                      │ │
│  │ - clear-user-detail-cache     │                      │ │
│  │ - export-user-snapshot        │                      │ │
│  └───────────────────────────────┼──────────────────────┘ │
│                                  │                        │
│  ┌───────────────────────────────▼─────────────────────┐ │
│  │ LogicEngineService (Epic 4)                         │ │
│  │                                                     │ │
│  │ - getUserDetailAsync(userId)                        │ │
│  │ - buildUserDetailProjection(userId)                 │ │
│  │ - Correlation logic (13+ methods)                   │ │
│  │ - In-memory data indices (13+ maps)                 │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Keyboard Navigation Map

```
┌──────────────────────────────────────────────────────────────┐
│ UserDetailView Keyboard Shortcuts                           │
│                                                              │
│ Global Actions:                                              │
│   Ctrl+R  →  Refresh user data from LogicEngine             │
│   Ctrl+E  →  Export user snapshot (JSON format)             │
│   Ctrl+W  →  Close current UserDetailView tab               │
│                                                              │
│ Tab Navigation:                                              │
│   Ctrl+1  →  Switch to Overview tab                          │
│   Ctrl+2  →  Switch to Devices tab                           │
│   Ctrl+3  →  Switch to Apps tab                              │
│   Ctrl+4  →  Switch to Groups tab                            │
│   Ctrl+5  →  Switch to GPOs tab                              │
│   Ctrl+6  →  Switch to File Access tab                       │
│   Ctrl+7  →  Switch to Mailbox tab                           │
│   Ctrl+8  →  Switch to Azure Roles tab                       │
│   Ctrl+9  →  Switch to SQL & Risks tab                       │
│                                                              │
│ UI Navigation:                                               │
│   Tab     →  Move focus to next interactive element         │
│   Shift+Tab → Move focus to previous element                │
│   Enter   →  Activate focused button/link                   │
│   Space   →  Toggle focused checkbox/button                 │
│                                                              │
│ DataGrid Navigation (when grid is focused):                  │
│   ↑/↓     →  Navigate rows up/down                           │
│   ←/→     →  Navigate columns left/right                     │
│   Home    →  Jump to first row                               │
│   End     →  Jump to last row                                │
│   PageUp  →  Scroll up one page                              │
│   PageDown→  Scroll down one page                            │
│                                                              │
│ Screen Reader Announcements:                                 │
│   - Tab labels announced when switching tabs                 │
│   - Button actions announced on hover/focus                  │
│   - Grid cell content announced during navigation            │
│   - Loading state announced when data is fetching            │
│   - Error messages announced when errors occur               │
└──────────────────────────────────────────────────────────────┘
```

---

## Performance Optimization Strategy

```
┌──────────────────────────────────────────────────────────────┐
│ Performance Optimization Layers                              │
│                                                              │
│ Layer 1: Data Loading (IPC)                                  │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ LogicEngineService Cache (Main Process)                 │ │
│ │ - 15-minute TTL cache for user detail projections       │ │
│ │ - Invalidated on explicit refresh (Ctrl+R)              │ │
│ │ - Reduces IPC round-trips by 95% for repeated access    │ │
│ │                                                          │ │
│ │ Impact: 300ms → 10ms for cached data                    │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Layer 2: Component Rendering (React)                         │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ React.memo on Tab Components                            │ │
│ │ - Prevents re-render when parent state changes          │ │
│ │ - Only re-renders when tab data changes                 │ │
│ │                                                          │ │
│ │ Impact: 8 unnecessary re-renders → 0                    │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Layer 3: Data Grid Rendering (AG Grid)                       │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Virtualization (Row Rendering)                          │ │
│ │ - Renders only visible rows (~20-50 rows)               │ │
│ │ - Destroys off-screen rows                              │ │
│ │ - Reuses DOM elements via object pooling                │ │
│ │                                                          │ │
│ │ Impact: 10,000 rows → ~30 DOM nodes (constant memory)   │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Layer 4: Lazy Tab Loading (Custom Logic)                     │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Deferred Data Fetching                                  │ │
│ │ - Overview tab loads immediately (summary data)         │ │
│ │ - Other tabs load on first selection                    │ │
│ │ - Once loaded, data is cached in component state        │ │
│ │                                                          │ │
│ │ Impact: Initial load 500ms → 150ms (70% faster)         │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Layer 5: Memoization (useMemo, useCallback)                  │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Column Definitions Memoization                          │ │
│ │ - ColDef arrays are expensive to re-create              │ │
│ │ - useMemo ensures they're only created once             │ │
│ │                                                          │ │
│ │ Callback Memoization                                    │ │
│ │ - useCallback prevents function re-creation             │ │
│ │ - Reduces re-renders in child components                │ │
│ │                                                          │ │
│ │ Impact: 12ms → 1ms per render cycle                     │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Layer 6: Cleanup & Memory Management                         │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ useEffect Cleanup                                       │ │
│ │ - Remove event listeners on unmount                     │ │
│ │ - Destroy AG Grid instances on unmount                  │ │
│ │ - Cancel in-flight IPC requests on unmount              │ │
│ │                                                          │ │
│ │ Impact: Memory leak prevention, 50MB → 0MB on close     │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Combined Result:                                             │
│ - Initial load: <500ms (with cache: <100ms)                 │
│ - Tab switch: <100ms                                         │
│ - Grid scrolling: 60fps                                      │
│ - Memory per instance: <50MB                                 │
│ - Memory cleanup on close: 100% (no leaks)                   │
└──────────────────────────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────┐
│ Error Handling Decision Tree                                │
│                                                              │
│                    loadUserDetail()                          │
│                          │                                   │
│                          ↓                                   │
│              ┌───────────────────────┐                       │
│              │ IPC call successful?  │                       │
│              └───────────┬───────────┘                       │
│                          │                                   │
│          ┌───────────────┼───────────────┐                   │
│          NO              │               YES                 │
│          │               │                │                  │
│          ↓               ↓                ↓                  │
│    ┌─────────┐    ┌───────────┐    ┌──────────┐            │
│    │ Network │    │ User not  │    │ Success  │            │
│    │ timeout │    │  found    │    │          │            │
│    └────┬────┘    └─────┬─────┘    └────┬─────┘            │
│         │               │                │                  │
│         ↓               ↓                ↓                  │
│    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│    │ Retry logic │ │ Show error  │ │ Set state   │         │
│    │ 3 attempts  │ │ card with   │ │ Render UI   │         │
│    │ 1s, 2s, 3s  │ │ "User not   │ │             │         │
│    │ backoff     │ │  found"     │ │             │         │
│    └──────┬──────┘ └─────────────┘ └─────────────┘         │
│           │                                                 │
│           ↓                                                 │
│    ┌─────────────┐                                          │
│    │ All retries │                                          │
│    │   failed?   │                                          │
│    └──────┬──────┘                                          │
│           │                                                 │
│     ┌─────┼─────┐                                           │
│     YES         NO                                          │
│     │            │                                          │
│     ↓            ↓                                          │
│ ┌────────┐  ┌────────┐                                     │
│ │ Show   │  │ Success│                                     │
│ │ error  │  │ (retry │                                     │
│ │ with   │  │ worked)│                                     │
│ │ Retry  │  │        │                                     │
│ │ button │  │        │                                     │
│ └────────┘  └────────┘                                     │
│                                                             │
│ Error UI Examples:                                          │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │        ⚠️                                               │ │
│ │   Error Loading User Details                            │ │
│ │                                                         │ │
│ │   User not found in LogicEngine data                    │ │
│ │                                                         │ │
│ │   [🔄 Retry]                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │        ⚠️                                               │ │
│ │   Request Timed Out                                     │ │
│ │                                                         │ │
│ │   The system may be under heavy load.                   │ │
│ │   Please wait a moment and try again.                   │ │
│ │                                                         │ │
│ │   [🔄 Retry]    [❌ Close]                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Partial Data Handling:                                      │
│                                                             │
│ - Missing mailbox: Show "No mailbox data available"         │
│ - Empty groups: Show "User is not a member of any groups"   │
│ - Empty devices: Show "No devices assigned to this user"    │
│ - Empty apps: Show "No applications detected"               │
│                                                             │
│ All errors logged to console with full stack trace          │
│ Notifications shown to user for transient errors            │
└──────────────────────────────────────────────────────────────┘
```

---

## File Structure Tree

```
guiv2/
├── src/
│   ├── main/
│   │   ├── ipcHandlers.ts                    (MODIFIED: +3 handlers)
│   │   │   ├── get-user-detail
│   │   │   ├── clear-user-detail-cache
│   │   │   └── export-user-snapshot
│   │   │
│   │   └── services/
│   │       └── logicEngineService.ts         (EPIC 4 DEPENDENCY)
│   │           ├── getUserDetailAsync()
│   │           ├── buildUserDetailProjection()
│   │           ├── getGroupsForUser()
│   │           ├── getDevicesForUser()
│   │           ├── getAppsForUser()
│   │           ├── getDrivesForUser()
│   │           ├── getFileAccessForUser()
│   │           ├── getGposForUser()
│   │           ├── getMailboxForUser()
│   │           ├── getAzureRolesForUser()
│   │           ├── getSqlDatabasesForUser()
│   │           ├── calculateEntityRisks()
│   │           └── generateMigrationHints()
│   │
│   ├── preload.ts                            (MODIFIED: expose IPC API)
│   │
│   └── renderer/
│       ├── components/
│       │   ├── atoms/
│       │   │   ├── Button.tsx                (EXISTING: reused)
│       │   │   └── ModernCard.tsx            (EXISTING: reused)
│       │   │
│       │   ├── molecules/
│       │   │   └── LoadingOverlay.tsx        (EXISTING: reused)
│       │   │
│       │   └── organisms/
│       │       ├── DataGridWrapper.tsx       (EXISTING: reused)
│       │       └── TabView.tsx               (MODIFIED: add UserDetailView)
│       │
│       ├── hooks/
│       │   └── useUserDetailLogic.ts         (NEW: 150 lines)
│       │       ├── State: userDetail, isLoading, error, loadingMessage
│       │       ├── Actions: loadUserDetail, refreshData, addToMigrationWave
│       │       ├── Actions: exportSnapshot, closeView, setSelectedTab
│       │       └── Effects: Auto-load on mount/userId change
│       │
│       ├── store/
│       │   ├── useTabStore.ts                (EXISTING: reused)
│       │   ├── useModalStore.ts              (EXISTING: reused)
│       │   ├── useMigrationStore.ts          (EXISTING: reused)
│       │   └── useNotificationStore.ts       (EXISTING: reused)
│       │
│       ├── types/
│       │   ├── electron.d.ts                 (MODIFIED: add IPC types)
│       │   │
│       │   └── models/
│       │       ├── user.ts                   (MODIFIED: +UserDetailProjection)
│       │       │   ├── UserDetailProjection
│       │       │   ├── RiskItem
│       │       │   └── MigrationHint
│       │       │
│       │       ├── device.ts                 (EXISTING/ENHANCED)
│       │       ├── application.ts            (EXISTING/ENHANCED)
│       │       ├── group.ts                  (EXISTING/ENHANCED)
│       │       ├── gpo.ts                    (NEW: 30 lines)
│       │       │   └── GpoData
│       │       │
│       │       ├── fileAccess.ts             (NEW: 30 lines)
│       │       │   └── FileAccessEntry
│       │       │
│       │       ├── mailbox.ts                (NEW: 30 lines)
│       │       │   └── MailboxData
│       │       │
│       │       ├── azureRole.ts              (NEW: 30 lines)
│       │       │   └── AzureRoleAssignment
│       │       │
│       │       └── sqlDatabase.ts            (NEW: 30 lines)
│       │           └── SqlDatabaseData
│       │
│       └── views/
│           └── users/
│               ├── UsersView.tsx             (MODIFIED: add "View Details")
│               └── UserDetailView.tsx        (NEW: 800 lines)
│                   ├── Component: UserDetailView
│                   ├── Tabs: OverviewTab, DevicesTab, AppsTab
│                   ├── Tabs: GroupsTab, GposTab, FileAccessTab
│                   ├── Tabs: MailboxTab, AzureRolesTab, SqlRisksTab
│                   ├── Helper: LabelValuePair
│                   ├── Helper: formatDate, formatDateTime
│                   └── Config: TAB_CONFIG, renderTabContent
│
└── Documentation/
    ├── Epic1_UserDetailView_Architecture.md       (NEW: full spec)
    ├── Epic1_UserDetailView_Executive_Summary.md  (NEW: this file)
    └── Epic1_UserDetailView_Visual_Guide.md       (NEW: visual guide)

Summary:
- NEW FILES: 8 (1 component, 1 hook, 6 type files)
- MODIFIED FILES: 4 (ipcHandlers, preload, UsersView, TabView)
- DEPENDENCY FILES: 1 (logicEngineService.ts from Epic 4)
- TOTAL LINES OF CODE: ~1,200 (800 component + 150 hook + 250 types)
```

---

**END OF VISUAL GUIDE**

This visual guide provides quick-reference diagrams for implementing the UserDetailView component. For complete implementation details, see the full architecture document.
