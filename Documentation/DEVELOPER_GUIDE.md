# Developer Onboarding Guide
## Enterprise Discovery System - GUIV2

Welcome to the Enterprise Discovery System! This guide will help you get started with development.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Architecture Overview](#architecture-overview)
5. [Key Concepts](#key-concepts)
6. [Common Tasks](#common-tasks)
7. [Testing](#testing)
8. [Debugging](#debugging)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- **Node.js:** v16+ (v18 recommended)
- **npm:** v8+
- **PowerShell:** 7+ (for discovery modules)
- **Windows:** 10/11 or Windows Server 2019+
- **Git:** Latest version

### Installation

```bash
# Clone repository
git clone <repository-url>
cd UserMandA

# Install dependencies (workspace)
cd guiv2
npm install

# Build all bundles
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer

# Start development server
npm run dev
```

### First Run

1. The app will open automatically
2. Complete the initial setup wizard
3. Configure your first discovery target
4. Run a test discovery (Application Discovery recommended)

---

## Project Structure

```
UserMandA/
├── guiv2/                          # Electron GUI application
│   ├── src/
│   │   ├── main/                   # Main process (Node.js)
│   │   │   ├── services/           # Backend services
│   │   │   ├── ipc/                # IPC handlers
│   │   │   └── index.ts            # Entry point
│   │   ├── renderer/               # Renderer process (React)
│   │   │   ├── components/         # React components
│   │   │   │   ├── atoms/          # Basic UI elements
│   │   │   │   ├── molecules/      # Composite components
│   │   │   │   └── organisms/      # Complex components
│   │   │   ├── views/              # Page-level components
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   ├── store/              # Zustand state management
│   │   │   ├── services/           # Frontend services
│   │   │   └── types/              # TypeScript types
│   │   ├── preload.ts              # Preload script (security bridge)
│   │   └── shared/                 # Shared utilities
│   │       ├── security.ts         # Input sanitization
│   │       ├── logger.ts           # Logging utilities
│   │       └── memoryMonitor.ts    # Memory monitoring
│   ├── webpack.*.config.js         # Webpack configurations
│   └── package.json
├── Modules/                        # PowerShell discovery modules
│   ├── Discovery/                  # Discovery implementations
│   │   ├── DiscoveryBase.psm1      # Base module
│   │   ├── ApplicationDiscovery.psm1
│   │   ├── AzureDiscovery.psm1
│   │   └── ...                     # 55 discovery modules
│   └── Common/                     # Shared PowerShell utilities
├── Scripts/                        # Standalone PowerShell scripts
└── Documentation/                  # Project documentation
    ├── claude.local.md             # AI agent reference
    └── DEVELOPER_GUIDE.md          # This file
```

---

## Development Workflow

### Directory Duality

The project uses two directories:

- **Workspace:** `D:\Scripts\UserMandA\` - For development and version control
- **Deployment:** `C:\enterprisediscovery\` - For building and running

**CRITICAL:** Always build in the deployment directory!

### Standard Workflow

```bash
# 1. Modify files in WORKSPACE
cd D:\Scripts\UserMandA\guiv2
# ... make your changes ...

# 2. Sync workspace → deployment
Copy-Item -Path 'D:\Scripts\UserMandA\guiv2\src\*' -Destination 'C:\enterprisediscovery\guiv2\src\' -Recurse -Force

# 3. Build in DEPLOYMENT directory
cd C:\enterprisediscovery\guiv2
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer

# 4. Test
npm start

# 5. Sync deployment → workspace (for version control)
Copy-Item -Path 'C:\enterprisediscovery\guiv2\src\*' -Destination 'D:\Scripts\UserMandA\guiv2\src\' -Recurse -Force

# 6. Commit from workspace
cd D:\Scripts\UserMandA
git add .
git commit -m "Your commit message"
```

---

## Architecture Overview

### Electron Architecture

```
┌─────────────────────────────────────────┐
│           Main Process (Node.js)        │
│  - File system access                   │
│  - PowerShell execution                 │
│  - IPC handlers                         │
│  - Services (background tasks)          │
└──────────────┬──────────────────────────┘
               │ IPC (contextBridge)
┌──────────────▼──────────────────────────┐
│        Preload Script (Bridge)          │
│  - Exposes safe APIs to renderer        │
│  - Security boundary                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     Renderer Process (React/Browser)    │
│  - UI components                        │
│  - State management (Zustand)           │
│  - User interactions                    │
└─────────────────────────────────────────┘
```

### Discovery Flow

```
User Action
    ↓
React Hook (useXXXDiscoveryLogic.ts)
    ↓
IPC Call (window.electron.executeDiscovery)
    ↓
Main Process Handler (moduleDiscoveryHandlers.ts)
    ↓
PowerShell Execution (Discovery Module .psm1)
    ↓
Results Written (CSV/JSON files)
    ↓
IPC Event (onDiscoveryComplete)
    ↓
React Hook Updates State
    ↓
UI Re-renders with Results
```

---

## Key Concepts

### 1. Discovery Modules

**55 discovery modules** scan different environments:
- **Cloud & Identity:** Azure, Entra ID, Office 365, Google Workspace (15 modules)
- **Infrastructure:** Network, Servers, Storage, Virtualization (17 modules)
- **Security:** Certificates, DLP, Compliance (10 modules)
- **Applications:** SQL, SharePoint, Power BI (13 modules)

### 2. Discovery Hook Pattern

All discovery hooks follow this standard pattern:

```typescript
// Event listeners with EMPTY dependency array
useEffect(() => {
  const unsubscribe = window.electron.onDiscoveryComplete((data) => {
    if (data.executionId === currentTokenRef.current) {
      setIsRunning(false);
      const result = { moduleName: 'ModuleName', ... };
      addResult(result);  // Persist to store
    }
  });
  return () => unsubscribe?.();
}, []); // CRITICAL: Empty array prevents stale closures

// Start discovery
const startDiscovery = useCallback(async () => {
  const token = `module-discovery-${Date.now()}`;
  currentTokenRef.current = token;

  await window.electron.executeDiscovery({
    moduleName: 'ModuleName',
    parameters: { ... },
    executionId: token
  });
}, []);
```

### 3. State Management

Uses **Zustand** for global state:

```typescript
// Store definition
interface DiscoveryStore {
  results: Map<string, DiscoveryResult>;
  addResult: (result: DiscoveryResult) => void;
}

// Usage in components
const { results, addResult } = useDiscoveryStore();
```

### 4. Security Principles

- **Input Sanitization:** Always sanitize user input (use `security.ts` utilities)
- **IPC Security:** Only expose necessary APIs via preload script
- **No Eval:** Never use `eval()` or `Function()` constructor
- **CSP:** Content Security Policy enforced (see `index.html`)

---

## Common Tasks

### Creating a New Discovery Hook

1. **Copy template:**
   ```bash
   cp src/renderer/hooks/useApplicationDiscoveryLogic.ts src/renderer/hooks/useNewModuleDiscoveryLogic.ts
   ```

2. **Update hook:**
   - Change `moduleName` to match PowerShell module
   - Update interface types
   - Customize column definitions
   - Update result extraction logic

3. **Create PowerShell module:**
   ```powershell
   # See Modules/Discovery/ApplicationDiscovery.psm1 as reference
   # Must export: Invoke-Discovery function
   # Must write: ModuleName.csv and ModuleName.json
   ```

4. **Register module:**
   - Add route in `App.tsx`
   - Add view in `views/discovery/`
   - Update navigation

### Adding a New Component

```typescript
// src/renderer/components/atoms/MyComponent.tsx
import React from 'react';

export interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {title}
    </button>
  );
};
```

### Adding a New Service

```typescript
// src/main/services/myService.ts
export class MyService {
  private static instance: MyService;

  static getInstance(): MyService {
    if (!MyService.instance) {
      MyService.instance = new MyService();
    }
    return MyService.instance;
  }

  async doSomething(): Promise<void> {
    // Implementation
  }
}
```

### Creating an IPC Handler

```typescript
// src/main/ipc/myHandlers.ts
import { ipcMain } from 'electron';

export function registerMyHandlers(): void {
  ipcMain.handle('my-action', async (event, args) => {
    try {
      // Process request
      return { success: true, data: result };
    } catch (error) {
      console.error('Error:', error);
      return { success: false, error: error.message };
    }
  });
}

// Expose in preload.ts
const api = {
  myAction: (args) => ipcRenderer.invoke('my-action', args)
};
```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- security.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Writing Tests

```typescript
// src/shared/__tests__/myFunction.test.ts
import { myFunction } from '../myFunction';

describe('myFunction', () => {
  test('handles valid input', () => {
    expect(myFunction('test')).toBe('expected');
  });

  test('handles edge cases', () => {
    expect(myFunction('')).toBe('');
    expect(myFunction(null)).toThrow();
  });
});
```

### Integration Testing

```bash
# Launch app in test mode
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- --spec=discovery.spec.ts
```

---

## Debugging

### Chrome DevTools

```typescript
// In renderer code
debugger; // Sets breakpoint

// Open DevTools
// View → Toggle Developer Tools (Ctrl+Shift+I)
```

### Main Process Debugging

1. Add to `package.json`:
   ```json
   "debug": "electron --inspect=5858 ."
   ```

2. Open Chrome: `chrome://inspect`

3. Click "Configure" → Add `localhost:5858`

4. Click "inspect" on your app

### PowerShell Debugging

```powershell
# In discovery module
Write-ModuleLog "Debug: Variable value = $myVar" -Level "DEBUG"

# Check logs
Get-Content "C:\DiscoveryData\CompanyName\Logs\ModuleName.log"
```

### Memory Profiling

```typescript
import { memoryMonitor } from '@/shared/memoryMonitor';

// Start monitoring
memoryMonitor.startAutoMonitoring();

// Get report
console.log(memoryMonitor.getReport());

// Check for leaks
if (memoryMonitor.detectLeakTrend()) {
  console.warn('Potential memory leak detected!');
}
```

---

## Best Practices

### Code Style

- **TypeScript:** Strict mode enabled
- **Naming:** camelCase for variables, PascalCase for types
- **Formatting:** Prettier auto-formats on save
- **Linting:** ESLint catches issues

### React Best Practices

```typescript
// ✅ GOOD: Memoize expensive computations
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);

// ✅ GOOD: Stable callback references
const handleClick = useCallback(() => {
  doSomething();
}, []);

// ❌ BAD: Creating new functions in render
<Button onClick={() => doSomething()} />

// ✅ GOOD: Ref for mutable values
const timerRef = useRef<NodeJS.Timeout>();

// ❌ BAD: State for DOM references
const [element, setElement] = useState<HTMLElement>();
```

### Security Best Practices

```typescript
// ✅ GOOD: Sanitize all user input
import { sanitizeFilePath, sanitizeHtmlInput } from '@/shared/security';

const safePath = sanitizeFilePath(userInput);
const safeHtml = sanitizeHtmlInput(userInput);

// ❌ BAD: Direct use of user input
const dangerousPath = userInput; // Directory traversal risk!

// ✅ GOOD: Validate data structures
import { validateCsvData } from '@/shared/security';

if (!validateCsvData(data)) {
  throw new Error('Invalid data format');
}
```

### Performance Best Practices

```typescript
// ✅ GOOD: Virtual scrolling for large lists
import { VirtualizedDataGrid } from '@/components/organisms/VirtualizedDataGrid';

<VirtualizedDataGrid data={largeDataset} />

// ✅ GOOD: Skeleton loading states
import { Skeleton } from '@/components/atoms/Skeleton';

{loading ? <Skeleton count={5} /> : <DataTable data={data} />}

// ✅ GOOD: Code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module preload.js"

**Cause:** Preload bundle not built

**Fix:**
```bash
cd C:\enterprisediscovery\guiv2
npx webpack --config webpack.preload.config.js --mode=production
```

#### 2. "EBUSY: resource busy"

**Cause:** Electron process still running

**Fix:**
```powershell
Get-Process -Name electron | Stop-Process -Force
```

#### 3. Discovery completes but shows 0 results

**Causes & Fixes:**
- **Filename mismatch:** Check CSV filename matches `ModuleName.csv`
- **moduleName mismatch:** Ensure hook `moduleName` matches execution `moduleName`
- **Data extraction:** Add debug logs to `onDiscoveryComplete` handler

#### 4. Webpack build errors

**Fix:**
```bash
# Clear webpack cache
rm -rf .webpack

# Rebuild all bundles
npm run build:main
npx webpack --config webpack.preload.config.js --mode=production
npm run build:renderer
```

#### 5. TypeScript errors

**Fix:**
```bash
# Check for type errors
npx tsc --noEmit

# Fix auto-fixable issues
npm run lint:fix
```

### Getting Help

1. **Documentation:** Check `claude.local.md` for technical patterns
2. **Logs:** Review application logs in `C:\DiscoveryData\{Company}\Logs\`
3. **DevTools:** Use Chrome DevTools for frontend debugging
4. **Issue Tracker:** Report bugs on GitHub

---

## Next Steps

1. **Complete First Discovery:** Run Application Discovery end-to-end
2. **Explore Codebase:** Review key files in `src/renderer/hooks/`
3. **Make Small Change:** Add a column to a discovery view
4. **Run Tests:** Ensure tests pass after your changes
5. **Read Architecture:** Deep dive into `claude.local.md`

---

## Resources

- **Project Documentation:** `Documentation/claude.local.md`
- **Electron Docs:** https://www.electronjs.org/docs
- **React Docs:** https://react.dev
- **TypeScript Docs:** https://www.typescriptlang.org/docs
- **PowerShell Docs:** https://docs.microsoft.com/powershell

---

**Welcome to the team! Happy coding! 🚀**
