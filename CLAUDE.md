# M&A Discovery Suite: GUI v2 - Agent-Orchestrated Refactor Specification

**Project Mandate:** Full rewrite of `/GUI` (C#/WPF) to `/guiv2` (TypeScript/React/Electron) with 100% feature parity, orchestrated by ProjectLead agent delegating to specialist agents.

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

## Phase 0: Project Scaffolding & Build Setup

**Goal:** Initialize Electron project with TypeScript + Webpack + Tailwind + Testing

### Task 0.1: Build System Initialization
**Delegate to:** Build_Webpack_Specialist

**Instructions:**
1. Create `/guiv2` directory if not exists
2. Initialize Electron app: `npx create-electron-app@latest . --template=typescript-webpack`
3. Install ALL dependencies in one command:

```bash
# Runtime dependencies
npm install zustand ag-grid-react ag-grid-community ag-grid-enterprise lucide-react tailwind-merge clsx papaparse react-router-dom react-window recharts date-fns immer @headlessui/react

# Zustand middleware
npm install zustand/middleware

# Dev dependencies
npm install -D tailwindcss postcss postcss-loader autoprefixer @types/react-router-dom @types/papaparse jest @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test eslint-plugin-jsx-a11y webpack-bundle-analyzer source-map-explorer @tailwindcss/forms @tailwindcss/typography
```

4. Configure Tailwind:
   - Run `npx tailwindcss init -p`
   - Update `tailwind.config.js`:
     ```js
     module.exports = {
       content: ["./src/**/*.{js,jsx,ts,tsx}"],
       darkMode: 'class',
       theme: {
         extend: {
           colors: { /* Will be defined in Phase 2 by TypeScript_Typing_Guardian */ }
         }
       },
       plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
     }
     ```
   - Ensure PostCSS loader is configured in webpack for Tailwind processing

5. Create `guiv2/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --spacing-unit: 4px;
}
```

6. Add bundle analysis script to `package.json`:
```json
{
  "scripts": {
    "analyze": "webpack-bundle-analyzer dist/stats.json"
  }
}
```

**Acceptance Criteria:**
- `npm start` launches Electron app
- Tailwind classes work
- TypeScript compiles without errors
- Bundle analyzer works

---

### Task 0.2: Testing Framework Setup
**Delegate to:** E2E_Testing_Cypress_Expert

**Instructions:**
1. Create `guiv2/jest.config.js`:
```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main/**/*',
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 }
  }
};
```

2. Create `guiv2/playwright.config.ts` for E2E testing
3. Create `guiv2/src/setupTests.ts` with test utilities

**Acceptance Criteria:**
- `npm test` runs Jest
- Coverage report generates
- Playwright configured for Electron

---

### Task 0.3: Directory Structure Creation
**Delegate to:** Build_Webpack_Specialist

**Instructions:**
Create this EXACT directory structure in `guiv2/src/`:

```
src/
├── main/
│   ├── services/
│   │   ├── powerShellService.ts
│   │   ├── moduleRegistry.ts
│   │   ├── configService.ts
│   │   ├── credentialService.ts
│   │   └── fileService.ts
│   ├── ipcHandlers.ts
│   └── main.ts
├── preload.ts
└── renderer/
    ├── assets/
    ├── components/
    │   ├── atoms/
    │   ├── molecules/
    │   └── organisms/
    ├── hooks/
    ├── lib/
    ├── services/
    ├── store/
    ├── styles/
    ├── types/
    │   └── models/
    └── views/
        ├── overview/
        ├── discovery/
        ├── users/
        ├── groups/
        ├── infrastructure/
        ├── migration/
        ├── reports/
        └── settings/
```

Also create:
- `guiv2/cypress/e2e/` for E2E tests
- `.gitignore` entries for node_modules, dist, .env

**Acceptance Criteria:**
- All directories exist
- No build errors

---

## Phase 1: Type Definitions & Backend Services

**Goal:** Define ALL types first, then implement backend services

### Task 1.1: Core Type Definitions
**Delegate to:** TypeScript_Typing_Guardian

**Instructions:**
1. Examine `GUI/Models/*.cs` files
2. For EACH C# model, create corresponding TypeScript interface in `guiv2/src/renderer/types/models/`

**Mapping Rules:**
- `List<T>` → `T[]`
- `Dictionary<K,V>` → `Record<K, V>`
- `ObservableCollection<T>` → `T[]` (Zustand manages reactivity)
- `string?` → `string | null`
- `DateTime` → `Date` or `string` (ISO format)

**Critical Types to Define:**
- `guiv2/src/renderer/types/models/user.ts` - UserData interface
- `guiv2/src/renderer/types/models/group.ts` - GroupData interface
- `guiv2/src/renderer/types/models/profile.ts` - Profile, ConnectionStatus
- `guiv2/src/renderer/types/models/discovery.ts` - DiscoveryResult, DiscoveryConfig
- `guiv2/src/renderer/types/models/migration.ts` - MigrationWave, ResourceMapping, ValidationResult
- `guiv2/src/renderer/types/common.ts` - Shared utility types

**IPC Contract:**
Create `guiv2/src/renderer/types/electron.d.ts`:
```typescript
export interface ElectronAPI {
  // PowerShell execution
  executeScript: (params: {
    scriptPath: string;
    args: string[];
    options?: ExecutionOptions;
  }) => Promise<ExecutionResult>;

  executeModule: (params: {
    modulePath: string;
    functionName: string;
    parameters: Record<string, any>;
    options?: ExecutionOptions;
  }) => Promise<ExecutionResult>;

  cancelExecution: (token: string) => Promise<boolean>;

  // File operations
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;

  // Configuration
  getConfig: (key: string) => Promise<any>;
  setConfig: (key: string, value: any) => Promise<void>;

  // Events (for progress streaming)
  onProgress: (callback: (data: ProgressData) => void) => () => void;
  onOutput: (callback: (data: OutputData) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

**Also Define:**
- `ExecutionOptions` - timeout, cancellationToken, streamOutput, priority
- `ExecutionResult` - success, data, error, duration, warnings
- `PowerShellServiceConfig` - maxPoolSize, minPoolSize, sessionTimeout, queueSize
- `ModuleDefinition` - for module registry
- `BaseService` interface - for service registry pattern

**Acceptance Criteria:**
- Zero `any` types
- All C# models have TS equivalents
- Strict mode enabled in tsconfig.json
- IPC contract fully typed

---

### Task 1.2: PowerShell Execution Service (CRITICAL)
**Delegate to:** ElectronMain_Process_Specialist

**Instructions:**
Create `guiv2/src/main/services/powerShellService.ts` with **enterprise-grade** PowerShell execution:

**Requirements:**
1. **Session Pooling:**
   - Min pool size: 2, Max: 10
   - Reuse sessions for performance
   - Timeout idle sessions after 5 minutes

2. **Execution Methods:**
```typescript
class PowerShellExecutionService extends EventEmitter {
  async executeScript(scriptPath: string, args: string[], options?: ExecutionOptions): Promise<ExecutionResult>
  async executeModule(modulePath: string, functionName: string, params: Record<string, any>, options?: ExecutionOptions): Promise<ExecutionResult>
  cancelExecution(token: string): boolean
  getStatistics(): PoolStatistics
}
```

3. **Features:**
   - Use `spawn` (not exec) with `-NoProfile -ExecutionPolicy Bypass -File`
   - Parse stdout as JSON, reject on non-zero exit or stderr
   - Stream output via EventEmitter for real-time progress
   - Cancellation token support
   - Request queue when pool exhausted
   - Module result caching (optional, configurable)

4. **Error Handling:**
   - Timeout with configurable duration (default 60s)
   - Proper process cleanup
   - Detailed error messages with stderr content

**Dependencies:** Uses types from Task 1.1

**Acceptance Criteria:**
- Can execute PowerShell scripts and get JSON results
- Cancellation works
- Pool limits respected
- Events emit for streaming output

---

### Task 1.3: Module Registry System
**Delegate to:** ElectronMain_Process_Specialist

**Instructions:**
Create `guiv2/src/main/services/moduleRegistry.ts`:

```typescript
class ModuleRegistry {
  private modules: Map<string, ModuleDefinition>;

  async loadRegistry(registryPath: string): Promise<void>
  async registerModule(module: ModuleDefinition): Promise<void>
  async executeModule(moduleId: string, params: Record<string, any>, options?: ExecutionOptions): Promise<any>
  getModulesByCategory(category: 'discovery' | 'migration' | 'reporting' | 'security' | 'compliance'): ModuleDefinition[]
  validateModuleParameters(moduleId: string, params: Record<string, any>): ValidationResult
  searchModules(query: string): ModuleDefinition[]
}
```

**Purpose:** Centralized registry of all discovery/migration modules with metadata (name, description, category, parameters, permissions, timeout)

**Dependencies:** Task 1.2 (PowerShellService)

**Acceptance Criteria:**
- Loads module definitions from JSON
- Validates parameters before execution
- Categorizes modules

---

### Task 1.4: IPC Handlers Registration
**Delegate to:** ElectronMain_Process_Specialist

**Instructions:**
Create `guiv2/src/main/ipcHandlers.ts` and register ALL IPC handlers:

```typescript
import { ipcMain } from 'electron';
import PowerShellExecutionService from './services/powerShellService';
import ModuleRegistry from './services/moduleRegistry';
import ConfigService from './services/configService';

export function registerIpcHandlers() {
  const psService = new PowerShellExecutionService({ maxPoolSize: 10 });
  const moduleRegistry = new ModuleRegistry();
  const configService = new ConfigService();

  // PowerShell execution
  ipcMain.handle('powershell:executeScript', async (_, params) => {
    return psService.executeScript(params.scriptPath, params.args, params.options);
  });

  ipcMain.handle('powershell:executeModule', async (_, params) => {
    return psService.executeModule(params.modulePath, params.functionName, params.parameters, params.options);
  });

  ipcMain.handle('powershell:cancel', async (_, token) => {
    return psService.cancelExecution(token);
  });

  // Module registry
  ipcMain.handle('modules:getByCategory', async (_, category) => {
    return moduleRegistry.getModulesByCategory(category);
  });

  // Configuration
  ipcMain.handle('config:get', async (_, key) => {
    return configService.get(key);
  });

  ipcMain.handle('config:set', async (_, key, value) => {
    return configService.set(key, value);
  });

  // File operations
  ipcMain.handle('file:read', async (_, path) => {
    // Sanitize path, prevent directory traversal
    return fs.promises.readFile(path, 'utf-8');
  });

  ipcMain.handle('file:write', async (_, path, content) => {
    return fs.promises.writeFile(path, content, 'utf-8');
  });
}
```

**Security:**
- Sanitize ALL paths to prevent `../../` attacks
- Never trust renderer input
- All IPC via contextBridge in preload.ts

**Acceptance Criteria:**
- All handlers registered in main.ts
- Preload.ts exposes safe API via contextBridge
- No nodeIntegration: true

---

### Task 1.5: Preload Security Bridge
**Delegate to:** ElectronMain_Process_Specialist

**Instructions:**
Create `guiv2/src/preload.ts` using contextBridge to expose ONLY safe APIs:

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  executeScript: (params) => ipcRenderer.invoke('powershell:executeScript', params),
  executeModule: (params) => ipcRenderer.invoke('powershell:executeModule', params),
  cancelExecution: (token) => ipcRenderer.invoke('powershell:cancel', token),

  readFile: (path) => ipcRenderer.invoke('file:read', path),
  writeFile: (path, content) => ipcRenderer.invoke('file:write', path, content),

  getConfig: (key) => ipcRenderer.invoke('config:get', key),
  setConfig: (key, value) => ipcRenderer.invoke('config:set', key, value),

  // Event listeners for streaming
  onProgress: (callback) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('powershell:progress', subscription);
    return () => ipcRenderer.removeListener('powershell:progress', subscription);
  },

  onOutput: (callback) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on('powershell:output', subscription);
    return () => ipcRenderer.removeListener('powershell:output', subscription);
  }
});
```

**Security Rules:**
- NO direct access to ipcRenderer from renderer
- NO nodeIntegration
- ONLY explicitly exposed APIs

**Acceptance Criteria:**
- window.electronAPI available in renderer
- Matches types from electron.d.ts (Task 1.1)

---

### Task 1.6: Global State Architecture
**Delegate to:** State_Management_Specialist

**Instructions:**
Create Zustand stores with proper architecture:

**1. Root Store** (`guiv2/src/renderer/store/rootStore.ts`):
```typescript
import create from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useRootStore = create<RootState>()(
  subscribeWithSelector(
    devtools(
      persist(
        immer((set, get) => ({
          // Slices
          profile: createProfileSlice(set, get),
          discovery: createDiscoverySlice(set, get),
          migration: createMigrationSlice(set, get),
          ui: createUISlice(set, get),

          reset: () => set(initialState),
          hydrate: (state) => set(state),
        })),
        {
          name: 'manda-storage',
          version: 1,
          partialize: (state) => ({
            profile: { selectedProfile: state.profile.selectedProfile },
            ui: { theme: state.ui.theme, preferences: state.ui.preferences }
          })
        }
      )
    )
  )
);
```

**2. Profile Store** (`guiv2/src/renderer/store/useProfileStore.ts`):
```typescript
interface ProfileState {
  profiles: Profile[];
  selectedSourceProfile: Profile | null;
  selectedTargetProfile: Profile | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';

  loadProfiles: () => Promise<void>;
  setSelectedProfile: (profile: Profile, type: 'source' | 'target') => void;
  createProfile: (profile: Omit<Profile, 'id'>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  testConnection: (profile: Profile) => Promise<ConnectionResult>;
}
```

**3. Tab Store** (`guiv2/src/renderer/store/useTabStore.ts`):
```typescript
interface TabState {
  tabs: Tab[];
  selectedTabId: string | null;

  openTab: (tab: Omit<Tab, 'id'>) => void;
  closeTab: (id: string) => void;
  setSelectedTab: (id: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
}
```

**4. Discovery Store** (`guiv2/src/renderer/store/useDiscoveryStore.ts`)
**5. Migration Store** (`guiv2/src/renderer/store/useMigrationStore.ts`) - See Phase 6
**6. Theme Store** (`guiv2/src/renderer/store/useThemeStore.ts`)
**7. Modal Store** (`guiv2/src/renderer/store/useModalStore.ts`)

**Key Principles:**
- Each store handles async operations (isLoading, error states)
- All window.electronAPI calls happen in stores or hooks, NOT in components
- Use immer middleware for immutable updates

**Dependencies:** Task 1.1 (types)

**Acceptance Criteria:**
- Stores compile with strict types
- DevTools integration works
- Persistence works (test by refreshing app)

---

## Phase 2: UI Component Library

**Goal:** Build complete, accessible, reusable component library

### Task 2.1: Theme System Definition
**Delegate to:** TypeScript_Typing_Guardian

**Instructions:**
Create `guiv2/src/renderer/styles/themes.ts` with comprehensive theme system:

```typescript
interface Theme {
  name: string;
  colors: {
    primary: ColorScale;      // 50-900
    secondary: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    neutral: ColorScale;
    background: { primary: string; secondary: string; tertiary: string; };
    text: { primary: string; secondary: string; tertiary: string; disabled: string; };
    border: { light: string; medium: string; heavy: string; };
  };
  spacing: { xs: string; sm: string; md: string; lg: string; xl: string; xxl: string; };
  typography: {
    fontFamily: { primary: string; mono: string; };
    fontSize: { xs: string; sm: string; base: string; lg: string; xl: string; '2xl': string; '3xl': string; };
    fontWeight: { normal: number; medium: number; semibold: number; bold: number; };
    lineHeight: { tight: number; normal: number; relaxed: number; };
  };
  shadows: { sm: string; md: string; lg: string; xl: string; };
  borderRadius: { sm: string; md: string; lg: string; full: string; };
  animation: {
    duration: { fast: string; normal: string; slow: string; };
    easing: { linear: string; easeIn: string; easeOut: string; easeInOut: string; };
  };
}

export const lightTheme: Theme = { /* Detailed values */ };
export const darkTheme: Theme = { /* Detailed values */ };
export const highContrastTheme: Theme = { /* WCAG AAA */ };
export const colorBlindTheme: Theme = { /* Accessibility */ };
```

**Acceptance Criteria:**
- 4 complete themes defined
- All color scales have 50-900 values
- High contrast theme meets WCAG AAA

---

### Task 2.2: Atomic Components - Buttons & Inputs
**Delegate to:** React_Component_Architect

**Instructions:**
Create these atom components with **full accessibility**:

**1. Button** (`guiv2/src/components/atoms/Button.tsx`):
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'leading' | 'trailing';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  'data-cy'?: string;  // For Cypress
}
```

**Accessibility Requirements:**
- Full keyboard support (Enter, Space)
- Visible focus ring
- ARIA labels
- Disabled state prevents clicks
- Loading state shows spinner + "aria-busy"

**Styling:** Tailwind CSS ONLY, use `clsx` for conditional classes

**2. Input** (`guiv2/src/components/atoms/Input.tsx`):
- Label association (htmlFor)
- Error state with message
- Help text support
- Required indicator
- Accessible error announcements (aria-describedby)

**3. Select** (`guiv2/src/components/atoms/Select.tsx`)
**4. Checkbox** (`guiv2/src/components/atoms/Checkbox.tsx`)
**5. Badge** (`guiv2/src/components/atoms/Badge.tsx`)
**6. Tooltip** (`guiv2/src/components/atoms/Tooltip.tsx`) - Use @headlessui/react
**7. Spinner** (`guiv2/src/components/atoms/Spinner.tsx`)
**8. StatusIndicator** (`guiv2/src/components/atoms/StatusIndicator.tsx`) - Colored dot + text

**Acceptance Criteria:**
- All components have `data-cy` attributes
- Pass eslint-plugin-jsx-a11y checks
- Work with keyboard only
- Responsive to theme changes

---

### Task 2.3: Molecule Components
**Delegate to:** React_Component_Architect

**Instructions:**
Create composed components:

**1. SearchBar** (`guiv2/src/components/molecules/SearchBar.tsx`):
- Input with search icon
- Clear button when text present
- Debounced onChange (300ms)

**2. FilterPanel** (`guiv2/src/components/molecules/FilterPanel.tsx`):
- Collapsible panel
- Multiple filter inputs
- Reset filters button

**3. Pagination** (`guiv2/src/components/molecules/Pagination.tsx`):
- Page number display
- Previous/Next buttons
- Jump to page input
- Items per page selector

**4. ProfileSelector** (`guiv2/src/components/molecules/ProfileSelector.tsx`):
- Dropdown of profiles from useProfileStore
- Test Connection button
- Create/Delete profile actions

**5. ProgressBar** (`guiv2/src/components/molecules/ProgressBar.tsx`)

**Dependencies:** Atoms from Task 2.2, stores from Task 1.6

**Acceptance Criteria:**
- Use atom components
- Stateless (props only)
- data-cy attributes present

---

### Task 2.4: Virtualized Data Grid (CRITICAL)
**Delegate to:** React_Component_Architect

**Instructions:**
Create `guiv2/src/components/organisms/VirtualizedDataGrid.tsx`:

```typescript
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';

interface VirtualizedDataGridProps {
  data: any[];
  columns: ColDef[];
  loading?: boolean;
  virtualRowHeight?: number;
  enableColumnReorder?: boolean;
  enableColumnResize?: boolean;
  enableExport?: boolean;
  enablePrint?: boolean;
  enableGrouping?: boolean;
  enableFiltering?: boolean;
  onRowClick?: (row: any) => void;
  onSelectionChange?: (rows: any[]) => void;
  'data-cy'?: string;
}

const VirtualizedDataGrid: React.FC<VirtualizedDataGridProps> = ({
  data,
  columns,
  loading = false,
  enableColumnReorder = true,
  enableColumnResize = true,
  enableExport = true,
  enableGrouping = false,
  enableFiltering = true,
  onRowClick,
  onSelectionChange,
  'data-cy': dataCy,
}) => {
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: enableFiltering,
    resizable: enableColumnResize,
    floatingFilter: enableFiltering,
  }), [enableFiltering, enableColumnResize]);

  return (
    <div className="ag-theme-alpine h-full w-full" data-cy={dataCy}>
      {loading && <div>Loading...</div>}
      <AgGridReact
        rowData={data}
        columnDefs={columns}
        defaultColDef={defaultColDef}
        rowSelection="multiple"
        enableRangeSelection
        rowBuffer={20}
        pagination
        paginationPageSize={100}
        onRowClicked={onRowClick}
        onSelectionChanged={(e) => onSelectionChange?.(e.api.getSelectedRows())}
      />
    </div>
  );
};
```

**Features:**
- Virtual scrolling for 100,000+ rows
- Export to CSV/Excel
- Print support
- Column visibility controls
- Custom cell renderers with React.memo

**Dependencies:** AG Grid Enterprise installed in Phase 0

**Acceptance Criteria:**
- Handles 100,000 rows at 60 FPS
- Export works
- Keyboard navigation works

---

### Task 2.5: Organism Components - Application Shell
**Delegate to:** React_Component_Architect

**Instructions:**
Create these complex components:

**1. Sidebar** (`guiv2/src/components/organisms/Sidebar.tsx`):
```typescript
const Sidebar: React.FC = () => {
  const { selectedProfile } = useProfileStore();
  const { theme, setTheme } = useThemeStore();
  const { systemStatus } = useSystemStatusStore();

  return (
    <aside className="w-64 bg-gray-900 text-white">
      <ProfileSelector />
      <nav>
        <NavLink to="/">Overview</NavLink>
        <NavLink to="/discovery">Discovery</NavLink>
        <NavLink to="/users">Users</NavLink>
        <NavLink to="/groups">Groups</NavLink>
        <NavLink to="/migration">Migration</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>
      <ThemeToggle />
      <SystemStatusPanel status={systemStatus} />
    </aside>
  );
};
```

**2. TabView** (`guiv2/src/components/organisms/TabView.tsx`):
- Subscribe to useTabStore
- Render active tab content dynamically
- Tab close buttons
- Drag-to-reorder tabs

**3. CommandPalette** (`guiv2/src/components/organisms/CommandPalette.tsx`):
- Modal triggered by Ctrl+K
- Fuzzy search through command registry
- Keyboard-only navigation
- Recent commands tracking

**4. ErrorBoundary** (`guiv2/src/components/organisms/ErrorBoundary.tsx`):
- React error boundary
- Graceful fallback UI
- Error reporting to service

**Dependencies:** Molecules, stores, hooks

**Acceptance Criteria:**
- Sidebar shows correct active route
- Command palette keyboard shortcuts work
- Error boundary catches errors

---

## Phase 3: Main Application Assembly

**Goal:** Wire up routing, layout, lazy loading

### Task 3.1: Main App Component with Routing
**Delegate to:** React_Component_Architect

**Instructions:**
Create `guiv2/src/renderer/App.tsx`:

```typescript
import { HashRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from './components/layouts/MainLayout';
import Spinner from './components/atoms/Spinner';

// Lazy load ALL views
const OverviewView = lazy(() => import('./views/overview/OverviewView'));
const UsersView = lazy(() => import('./views/users/UsersView'));
const GroupsView = lazy(() => import('./views/groups/GroupsView'));
const MigrationView = lazy(() => import('./views/migration/MigrationView'));
// ... 98 more views

function App() {
  useKeyboardShortcuts();  // Global shortcuts hook

  return (
    <HashRouter>
      <MainLayout>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/" element={<OverviewView />} />
            <Route path="/users" element={<UsersView />} />
            <Route path="/groups" element={<GroupsView />} />
            <Route path="/migration/*" element={<MigrationView />} />
            {/* ... more routes */}
          </Routes>
        </Suspense>
      </MainLayout>
    </HashRouter>
  );
}
```

**Acceptance Criteria:**
- All views lazy loaded
- Routes work
- Loading spinner shows during code split loading

---

### Task 3.2: Keyboard Shortcuts Hook
**Delegate to:** State_Management_Specialist

**Instructions:**
Create `guiv2/src/renderer/hooks/useKeyboardShortcuts.ts`:

```typescript
export const useKeyboardShortcuts = () => {
  const { openModal } = useModalStore();
  const { closeTab, openTab } = useTabStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        openModal('commandPalette');
      }
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        closeTab();
      }
      // Ctrl+T, Ctrl+S, Ctrl+F, Ctrl+P, etc.
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
```

**Shortcuts to Implement:**
- Ctrl+K: Command palette
- Ctrl+W: Close tab
- Ctrl+T: New tab
- Ctrl+S: Save
- Ctrl+F: Focus search
- Ctrl+P: Print

**Acceptance Criteria:**
- All shortcuts work
- No conflicts with browser shortcuts

---

## Phase 4: Views Implementation (Tier 1 - Critical)

**Goal:** Implement 6 critical views with full functionality

### Task 4.1: Users View - Types & Logic
**Delegate to:** TypeScript_Typing_Guardian THEN State_Management_Specialist

**Step 1 (TypeScript_Typing_Guardian):**
Ensure `UserData` interface exists in `types/models/user.ts`

**Step 2 (State_Management_Specialist):**
Create `guiv2/src/renderer/hooks/useUsersViewLogic.ts`:

```typescript
export const useUsersViewLogic = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);

  const debouncedSearch = useDebounce(searchText, 300);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ActiveDirectoryDiscovery.psm1',
        functionName: 'Get-ADUsers',
        parameters: {},
      });
      setUsers(result.data.users);
    } catch (error) {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return users;
    return users.filter(u =>
      u.displayName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [users, debouncedSearch]);

  const columnDefs = useMemo<ColDef[]>(() => [
    { field: 'displayName', headerName: 'Name', sortable: true, filter: true },
    { field: 'email', headerName: 'Email', sortable: true, filter: true },
    { field: 'department', headerName: 'Department', sortable: true, filter: true },
  ], []);

  return {
    users: filteredUsers,
    isLoading,
    searchText,
    setSearchText,
    selectedUsers,
    setSelectedUsers,
    columnDefs,
    handleExport: () => { /* TODO */ },
    handleDelete: () => { /* TODO */ },
  };
};
```

---

### Task 4.2: Users View - UI Component
**Delegate to:** React_Component_Architect

**Instructions:**
Create `guiv2/src/renderer/views/users/UsersView.tsx`:

```typescript
import { useUsersViewLogic } from '@/hooks/useUsersViewLogic';
import VirtualizedDataGrid from '@/components/organisms/VirtualizedDataGrid';
import SearchBar from '@/components/molecules/SearchBar';
import Button from '@/components/atoms/Button';
import { Download, Trash } from 'lucide-react';

const UsersView: React.FC = () => {
  const {
    users,
    isLoading,
    searchText,
    setSearchText,
    selectedUsers,
    setSelectedUsers,
    columnDefs,
    handleExport,
    handleDelete,
  } = useUsersViewLogic();

  return (
    <div className="h-full flex flex-col" data-cy="users-view">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex gap-2">
          <Button onClick={handleExport} icon={<Download />} data-cy="export-btn">
            Export
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            disabled={selectedUsers.length === 0}
            data-cy="delete-btn"
          >
            <Trash /> Delete Selected
          </Button>
        </div>
      </div>

      <div className="px-4">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search users..."
          data-cy="user-search"
        />
      </div>

      <div className="flex-1 p-4">
        <VirtualizedDataGrid
          data={users}
          columns={columnDefs}
          loading={isLoading}
          onSelectionChange={setSelectedUsers}
          enableExport
          data-cy="users-grid"
        />
      </div>
    </div>
  );
};

export default UsersView;
```

**Dependencies:** Task 4.1, Task 2.4 (grid), Task 2.3 (search)

**Acceptance Criteria:**
- Loads users from PowerShell
- Search filters in real-time
- Export button enabled
- Delete button enabled when users selected

---

### Task 4.3: Repeat for Remaining Tier 1 Views
**Delegate to:** State_Management_Specialist THEN React_Component_Architect

**Instructions:**
Using the SAME pattern as Task 4.1 and 4.2, create:

1. **GroupsView** - Group management
2. **OverviewView** - Dashboard with system metrics
3. **DomainDiscoveryView** - AD discovery with form
4. **AzureDiscoveryView** - Azure AD discovery
5. **MigrationPlanningView** - Wave planning (see Phase 6 for details)

**Each view needs:**
- Types defined first
- Logic hook (useXViewLogic.ts)
- UI component
- data-cy attributes
- Error handling

---

## Phase 5: Dialogs & UX Features

### Task 5.1: Modal System
**Delegate to:** React_Component_Architect

**Instructions:**
Create modal components using @headlessui/react:

**1. CreateProfileDialog** (`guiv2/src/renderer/components/dialogs/CreateProfileDialog.tsx`):
- Form with validation
- Connection type selection
- Credential input
- Test connection button

**2. DeleteConfirmationDialog**
**3. ExportDialog** - CSV/Excel/PDF options
**4. ColumnVisibilityDialog** - For data grids
**5. SettingsDialog**

**Modal State:** Use `useModalStore` to manage open/close

**Acceptance Criteria:**
- Keyboard accessible (Esc to close)
- Focus trap
- ARIA labels

---

## Phase 6: Migration Module (CRITICAL - 30% of value)

### Task 6.1: Migration Types
**Delegate to:** TypeScript_Typing_Guardian

**Instructions:**
Define in `guiv2/src/renderer/types/models/migration.ts`:

```typescript
interface MigrationWave {
  id: string;
  name: string;
  description: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  status: 'planned' | 'ready' | 'executing' | 'paused' | 'completed' | 'failed';
  users: string[];
  resources: ResourceMapping[];
  priority: number;
}

interface ResourceMapping {
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  type: 'user' | 'group' | 'mailbox' | 'site' | 'license';
  status: 'pending' | 'mapped' | 'validated' | 'migrated' | 'error';
  conflicts: Conflict[];
}

interface ValidationResult {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface RollbackPoint {
  id: string;
  waveId: string;
  timestamp: Date;
  state: any; // Serialized state
}
```

---

### Task 6.2: Migration Store
**Delegate to:** State_Management_Specialist

**Instructions:**
Create `guiv2/src/renderer/store/useMigrationStore.ts`:

```typescript
interface MigrationState {
  waves: MigrationWave[];
  mappings: ResourceMapping[];
  validationResults: ValidationResult[];
  executionStatus: ExecutionStatus;
  rollbackPoints: RollbackPoint[];

  // Actions
  planWave: (wave: Omit<MigrationWave, 'id'>) => Promise<void>;
  updateWave: (id: string, updates: Partial<MigrationWave>) => Promise<void>;
  deleteWave: (id: string) => Promise<void>;

  mapResource: (mapping: ResourceMapping) => void;
  importMappings: (file: File) => Promise<void>;
  exportMappings: () => Promise<void>;
  validateMappings: () => Promise<ValidationResult[]>;

  executeMigration: (waveId: string) => Promise<void>;
  pauseMigration: (waveId: string) => Promise<void>;
  rollbackMigration: (pointId: string) => Promise<void>;

  subscribeToProgress: (waveId: string, callback: (progress: Progress) => void) => void;
}
```

---

### Task 6.3: Migration Views
**Delegate to:** React_Component_Architect

**Instructions:**
Create these views in `guiv2/src/renderer/views/migration/`:

**1. MigrationPlanningView.tsx:**
- Wave configuration form
- User assignment to waves
- Schedule picker (dates, times)
- Dependency mapping
- Risk assessment display

**2. MigrationMappingView.tsx:**
- Source ↔ Target mapping grid
- Bulk import/export
- Conflict resolution UI

**3. MigrationValidationView.tsx:**
- Pre-flight checks list
- Real-time validation status
- Fix recommendations

**4. MigrationExecutionView.tsx:**
- Real-time progress bars per wave
- Per-user status grid
- Live log streaming
- Pause/Resume/Rollback controls

---

## Phase 7: Analytics & Reporting

### Task 7.1: Report Views
**Delegate to:** React_Component_Architect

**Instructions:**
Install Recharts, create report views:

**1. ExecutiveDashboardView** - KPIs, charts
**2. UserReportView** - User analytics
**3. MigrationReportView** - Migration stats
**4. CustomReportBuilderView** - Drag-drop report builder

---

## Phase 8: Performance & Polish

### Task 8.1: Bundle Optimization
**Delegate to:** Build_Webpack_Specialist

**Instructions:**
1. Verify code splitting by route works
2. Run bundle analyzer, identify large deps
3. Lazy load AG Grid, Recharts
4. Enable tree shaking
5. Add gzip compression

**Target:** <5MB initial bundle

---

### Task 8.2: E2E Tests for Critical Paths
**Delegate to:** E2E_Testing_Cypress_Expert

**Instructions:**
Write Playwright tests for:
1. User journey: Launch app → Select profile → Discover users → Export
2. Migration journey: Create wave → Map users → Validate → Execute

---

## Success Criteria

### Functional
- ✅ All 102 views working
- ✅ PowerShell integration functional
- ✅ Migration module complete
- ✅ All data grids handle 100K rows

### Performance
- ✅ <3s initial load
- ✅ <500MB memory baseline
- ✅ 60 FPS scrolling

### Quality
- ✅ 80% code coverage
- ✅ WCAG AA compliance
- ✅ Zero TypeScript `any` types
- ✅ All E2E tests pass

---

## Agent Delegation Workflow

**ProjectLead orchestrates like this:**

1. **Phase 0:**
   - Task 0.1 → Build_Webpack_Specialist
   - Task 0.2 → E2E_Testing_Cypress_Expert
   - Task 0.3 → Build_Webpack_Specialist

2. **Phase 1 (Order matters!):**
   - Task 1.1 → TypeScript_Typing_Guardian (FIRST - defines all types)
   - Task 1.2 → ElectronMain_Process_Specialist (uses types from 1.1)
   - Task 1.3 → ElectronMain_Process_Specialist (uses 1.2)
   - Task 1.4 → ElectronMain_Process_Specialist (uses 1.2, 1.3)
   - Task 1.5 → ElectronMain_Process_Specialist (exposes 1.4)
   - Task 1.6 → State_Management_Specialist (uses types from 1.1)

3. **Phase 2:**
   - Task 2.1 → TypeScript_Typing_Guardian (theme types)
   - Task 2.2 → React_Component_Architect (atoms, uses 2.1)
   - Task 2.3 → React_Component_Architect (molecules, uses 2.2)
   - Task 2.4 → React_Component_Architect (grid)
   - Task 2.5 → React_Component_Architect (organisms, uses 2.2, 2.3, stores from 1.6)

4. **Phase 4 (For EACH view):**
   - Step 1: TypeScript_Typing_Guardian (ensure types exist)
   - Step 2: State_Management_Specialist (create logic hook)
   - Step 3: React_Component_Architect (create UI component using hook)
   - Step 4: E2E_Testing_Cypress_Expert (write tests)

**This pattern repeats for all 102 views.**
