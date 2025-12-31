**Author:** ljpops.com (Lukian Poleschtschuk)

**Last Updated:** 30/12/2025

**Status:** Production

**Version:** 1.0
# M&A Discovery Suite GUI v2 - Developer Guide

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Adding New Features](#adding-new-features)
4. [Code Patterns](#code-patterns)
5. [Testing Guidelines](#testing-guidelines)
6. [Build & Deployment](#build--deployment)
7. [Contributing](#contributing)

## Development Setup

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **PowerShell** 7.x or higher
- **Git** 2.x or higher
- **Visual Studio Code** (recommended IDE)

### Recommended VS Code Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Jest Runner
- Playwright Test for VSCode

### Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/UserMandA.git
cd UserMandA/guiv2

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Variables

Create a `.env.local` file in the `guiv2/` directory:

```env
NODE_ENV=development
LOG_LEVEL=debug
SCRIPTS_BASE_DIR=D:/Scripts/UserMandA
ENABLE_DEVTOOLS=true
```

## Project Structure

```
guiv2/
├── src/
│   ├── main/                    # Electron main process (Node.js)
│   │   ├── services/            # Backend services
│   │   │   ├── powerShellService.ts      # PowerShell execution
│   │   │   ├── migrationOrchestrationService.ts
│   │   │   ├── fileService.ts            # File operations
│   │   │   └── ...
│   │   ├── ipcHandlers.ts       # IPC handler registration
│   │   └── main.ts              # Main process entry
│   ├── renderer/                # React frontend
│   │   ├── components/          # UI components
│   │   │   ├── atoms/           # Basic elements (Button, Input)
│   │   │   ├── molecules/       # Composed components (SearchBar)
│   │   │   ├── organisms/       # Complex components (DataGrid)
│   │   │   ├── dialogs/         # Modal dialogs
│   │   │   └── layouts/         # Layout components
│   │   ├── views/               # Page components
│   │   │   ├── overview/
│   │   │   ├── discovery/
│   │   │   ├── users/
│   │   │   ├── migration/
│   │   │   └── reports/
│   │   ├── store/               # Zustand state stores
│   │   │   ├── useProfileStore.ts
│   │   │   ├── useThemeStore.ts
│   │   │   ├── useMigrationStore.ts
│   │   │   └── ...
│   │   ├── services/            # Frontend services
│   │   │   ├── discoveryService.ts
│   │   │   ├── exportService.ts
│   │   │   └── ...
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useDiscovery.ts
│   │   │   ├── useDataGrid.ts
│   │   │   └── ...
│   │   ├── types/               # TypeScript types
│   │   │   ├── models/
│   │   │   ├── shared.ts
│   │   │   └── electron.d.ts
│   │   ├── lib/                 # Utilities
│   │   │   ├── utils.ts
│   │   │   ├── validation.ts
│   │   │   └── formatters.ts
│   │   └── App.tsx              # Root component
│   ├── preload.ts               # Secure IPC bridge
│   └── index.css                # Global styles
├── docs/                        # Documentation
├── tests/                       # Test files
│   ├── e2e/                     # Playwright tests
│   └── unit/                    # Jest tests
├── scripts/                     # Build scripts
├── webpack.*.js                 # Webpack configs
├── tsconfig.json                # TypeScript config
├── tailwind.config.js           # Tailwind config
├── jest.config.js               # Jest config
├── playwright.config.ts         # Playwright config
└── package.json                 # Dependencies
```

## Adding New Features

### Adding a New View

1. **Create the view component** (`src/renderer/views/example/ExampleView.tsx`):

```typescript
import React from 'react';
import { useExample } from '../../hooks/useExample';

export function ExampleView() {
  const { data, loading, error } = useExample();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Example View</h1>
      {/* Your UI here */}
    </div>
  );
}
```

2. **Create the logic hook** (`src/renderer/hooks/useExample.ts`):

```typescript
import { useState, useEffect } from 'react';

export function useExample() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const result = await window.electronAPI.invokeExample();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, reload: loadData };
}
```

3. **Add route** to `App.tsx`:

```typescript
<Route path="/example" element={<ExampleView />} />
```

4. **Add navigation item** to `Sidebar.tsx`:

```typescript
<NavLink to="/example">
  <Icon /> Example
</NavLink>
```

### Adding a New Service (Main Process)

1. **Create service** (`src/main/services/exampleService.ts`):

```typescript
/**
 * Example Service
 * Description of what this service does
 */

export class ExampleService {
  private config: any;

  constructor(config?: any) {
    this.config = config || {};
  }

  /**
   * Example method
   * @param param Description
   * @returns Description of return value
   */
  async doSomething(param: string): Promise<any> {
    // Implementation
    return result;
  }
}

export const exampleService = new ExampleService();
```

2. **Register IPC handler** in `src/main/ipcHandlers.ts`:

```typescript
import { exampleService } from './services/exampleService';

export function registerIpcHandlers() {
  // ... existing handlers ...

  ipcMain.handle('example:doSomething', async (_, param: string) => {
    return await exampleService.doSomething(param);
  });
}
```

3. **Expose in preload** (`src/preload.ts`):

```typescript
const electronAPI = {
  // ... existing APIs ...
  invokeExample: (param: string) =>
    ipcRenderer.invoke('example:doSomething', param),
};
```

4. **Update types** (`src/renderer/types/electron.d.ts`):

```typescript
interface ElectronAPI {
  // ... existing APIs ...
  invokeExample: (param: string) => Promise<any>;
}
```

### Adding a New Component

1. **Create component** (`src/renderer/components/atoms/NewComponent.tsx`):

```typescript
import React from 'react';
import { clsx } from 'clsx';

export interface NewComponentProps {
  /** Description of prop */
  value: string;
  /** Optional callback */
  onChange?: (value: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * NewComponent description
 *
 * @example
 * ```tsx
 * <NewComponent value="example" onChange={(v) => console.log(v)} />
 * ```
 */
export function NewComponent({ value, onChange, className }: NewComponentProps) {
  return (
    <div className={clsx('new-component', className)}>
      {/* Implementation */}
    </div>
  );
}
```

2. **Add tests** (`src/renderer/components/atoms/NewComponent.test.tsx`):

```typescript
import { render, screen } from '@testing-library/react';
import { NewComponent } from './NewComponent';

describe('NewComponent', () => {
  it('renders correctly', () => {
    render(<NewComponent value="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const onChange = jest.fn();
    render(<NewComponent value="test" onChange={onChange} />);
    // Test interaction
  });
});
```

### Adding a New Store

1. **Create store** (`src/renderer/store/useExampleStore.ts`):

```typescript
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface ExampleState {
  data: any[];
  loading: boolean;
  error: string | null;
}

interface ExampleActions {
  loadData: () => Promise<void>;
  setData: (data: any[]) => void;
  clearData: () => void;
}

type ExampleStore = ExampleState & ExampleActions;

export const useExampleStore = create<ExampleStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // State
        data: [],
        loading: false,
        error: null,

        // Actions
        async loadData() {
          set({ loading: true, error: null });
          try {
            const data = await window.electronAPI.invokeExample();
            set({ data, loading: false });
          } catch (error) {
            set({ error: error.message, loading: false });
          }
        },

        setData(data) {
          set({ data });
        },

        clearData() {
          set({ data: [], error: null });
        },
      })),
      {
        name: 'example-store',
      }
    )
  )
);
```

## Code Patterns

### State Management with Zustand

**Use stores for:**
- Global application state
- Shared data across components
- Complex state with multiple actions

**Use local state for:**
- Component-specific UI state
- Form inputs
- Temporary data

### Error Handling

**Main process:**
```typescript
try {
  const result = await operation();
  return result;
} catch (error) {
  logger.error('Operation failed', error);
  throw new CustomError('User-friendly message', error);
}
```

**Renderer process:**
```typescript
try {
  const result = await window.electronAPI.invoke();
  return result;
} catch (error) {
  notificationService.error('Operation failed', error.message);
  throw error;
}
```

### Styling with Tailwind

**Use Tailwind classes:**
```tsx
<div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
  {/* Content */}
</div>
```

**Use clsx for conditional classes:**
```tsx
<button className={clsx(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-300 text-gray-700',
  disabled && 'opacity-50 cursor-not-allowed'
)}>
  {children}
</button>
```

### Data Grid Integration

```tsx
import { VirtualizedDataGrid } from '../components/organisms/VirtualizedDataGrid';
import { ColDef } from 'ag-grid-community';

const columns: ColDef[] = [
  { field: 'name', headerName: 'Name', sortable: true, filter: true },
  { field: 'email', headerName: 'Email', sortable: true, filter: true },
  // ...
];

<VirtualizedDataGrid
  data={users}
  columns={columns}
  loading={loading}
  enableExport
  enableFiltering
  onRowClick={(row) => console.log(row)}
/>
```

## Testing Guidelines

### Unit Tests (Jest)

**Test files:** `*.test.ts` or `*.test.tsx`

```typescript
import { renderHook, act } from '@testing-library/react';
import { useExample } from './useExample';

describe('useExample', () => {
  it('loads data successfully', async () => {
    const { result } = renderHook(() => useExample());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.loading).toBe(false);
  });
});
```

### E2E Tests (Playwright)

**Test files:** `tests/e2e/*.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { launchApp, getMainWindow } from './helpers/electron';

test.describe('User Discovery', () => {
  test('should discover users successfully', async () => {
    const app = await launchApp();
    const window = await getMainWindow(app);

    // Navigate to discovery
    await window.click('[data-cy="nav-discovery"]');
    await window.click('[data-cy="nav-ad-discovery"]');

    // Start discovery
    await window.click('[data-cy="start-discovery"]');

    // Wait for results
    await window.waitForSelector('[data-cy="users-grid"]');

    const rowCount = await window.locator('[data-cy="users-grid"] .ag-row').count();
    expect(rowCount).toBeGreaterThan(0);

    await app.close();
  });
});
```

### Test Coverage

Run tests with coverage:

```bash
npm run test:coverage
```

Target: 80% code coverage

## Build & Deployment

### Development Build

```bash
npm start                 # Start development server
```

### Production Build

```bash
npm run package           # Create packaged application
npm run make              # Create distributable installer
```

### Bundle Analysis

```bash
npm run analyze           # Analyze bundle size
npm run check-size        # Verify bundle size limits
```

### Performance Testing

```bash
npm run performance:measure    # Measure performance metrics
```

## Contributing

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for formatting
- Write JSDoc comments for public APIs
- Add tests for new features

### Commit Messages

Follow conventional commits:

```
feat: Add user export functionality
fix: Resolve data grid sorting issue
docs: Update API documentation
test: Add tests for migration service
perf: Optimize PowerShell session pooling
```

### Pull Requests

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -am "feat: Add my feature"`
3. Push branch: `git push origin feature/my-feature`
4. Create pull request with description
5. Ensure CI passes
6. Request code review
7. Address feedback
8. Merge when approved

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] JSDoc comments added
- [ ] Tests added and passing
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Performance considered
- [ ] Accessibility checked
- [ ] Documentation updated

---

For more information, see:
- [User Guide](USER_GUIDE.md)
- [API Reference](API_REFERENCE.md)
- [Architecture](ARCHITECTURE.md)

