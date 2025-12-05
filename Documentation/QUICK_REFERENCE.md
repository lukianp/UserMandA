# M&A Discovery Suite GUI v2 - Quick Reference

**Version:** 1.0.0
**Status:** Production Ready
**Last Updated:** October 4, 2025

---

## 📁 Project Structure

```
guiv2/
├── src/
│   ├── main/                 # Electron Main Process (Node.js)
│   │   ├── services/        # 28 backend services
│   │   ├── ipcHandlers.ts   # IPC communication
│   │   └── main.ts          # Main entry point
│   ├── preload.ts           # Secure IPC bridge
│   └── renderer/            # React Frontend
│       ├── components/      # UI components (37 total)
│       │   ├── atoms/       # Basic UI (15 components)
│       │   ├── molecules/   # Composed UI (12 components)
│       │   └── organisms/   # Complex UI (10 components)
│       ├── hooks/           # Custom hooks (53 total)
│       ├── lib/             # Utilities (2 modules)
│       ├── services/        # Frontend services (27 total)
│       ├── store/           # Zustand stores (8 stores)
│       ├── types/           # TypeScript types
│       │   └── models/      # Data models (44 models)
│       └── views/           # Page components (102 views)
│           ├── admin/       # 8 admin views
│           ├── advanced/    # 41 advanced views
│           ├── analytics/   # 12 analytics views
│           ├── assets/      # 3 asset views
│           ├── compliance/  # 8 compliance views
│           ├── discovery/   # 26 discovery views
│           ├── migration/   # 4 migration views
│           └── ...
├── docs/                    # Documentation (8 guides)
├── e2e/                     # E2E tests (Playwright)
└── __tests__/              # Unit tests (106 tests)
```

---

## 🚀 Quick Start Commands

### Development
```bash
# Install dependencies
npm install

# Start development mode
npm start

# Start with DevTools
npm start -- --inspect

# Start renderer only (hot reload)
npm run start:renderer
```

### Building
```bash
# Build for production
npm run build

# Create distributable packages
npm run make

# Package without making installers
npm run package
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# View coverage report
npm run test:coverage:view
```

### Linting & Formatting
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type check
npm run type-check
```

### Documentation
```bash
# Generate TypeDoc documentation
npm run docs:generate

# Serve documentation locally
npm run docs:serve
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run analyze

# View bundle stats
npm run bundle:stats
```

---

## 📚 Key Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Electron** | 27.x | Desktop application framework |
| **React** | 18.x | UI library |
| **TypeScript** | 5.x | Type safety |
| **Zustand** | 4.x | State management |
| **Tailwind CSS** | 3.x | Styling |
| **AG Grid** | 31.x | Data grid |
| **Lucide React** | Latest | Icons |
| **React Router** | 6.x | Routing |
| **Jest** | 29.x | Unit testing |
| **Playwright** | Latest | E2E testing |
| **Webpack** | 5.x | Bundling |

---

## 🏗️ Architecture Patterns

### State Management (Zustand)
```typescript
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

const useStore = create(
  persist(
    devtools((set) => ({
      // State
      data: [],
      // Actions
      setData: (data) => set({ data }),
    })),
    { name: 'store-name' }
  )
);
```

### Component Structure (Atomic Design)
```
Atoms (Basic UI) → Molecules (Composed) → Organisms (Complex) → Views (Pages)
```

### IPC Communication
```typescript
// Main Process (ipcHandlers.ts)
ipcMain.handle('channel-name', async (event, args) => {
  // Handle request
  return result;
});

// Renderer Process (via preload)
const result = await window.electronAPI.methodName(args);
```

### PowerShell Execution
```typescript
// Execute script
const result = await window.electronAPI.executeScript({
  scriptName: 'Get-Users.ps1',
  args: ['param1', 'param2']
});

// Execute module
const result = await window.electronAPI.executeModule({
  moduleName: 'ModuleName',
  parameters: { key: 'value' }
});
```

---

## 📊 Performance Targets

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Bundle Size** | <15MB | 1.36MB | ✅ 91% under |
| **Initial Load** | <3s | <3s | ✅ Met |
| **View Switch** | <100ms | <100ms | ✅ Met |
| **Data Grid** | 100K rows @ 60 FPS | ✅ | ✅ Met |
| **Memory** | <500MB baseline | <500MB | ✅ Met |
| **Test Coverage** | 80% | 80%+ | ✅ Met |

---

## 🔑 Key Files & Locations

### Configuration
- `package.json` - Dependencies & scripts
- `tsconfig.json` - TypeScript config
- `tailwind.config.js` - Tailwind config
- `jest.config.js` - Jest config
- `playwright.config.ts` - Playwright config
- `webpack.*.config.ts` - Webpack configs
- `forge.config.ts` - Electron Forge config

### Entry Points
- `src/main/main.ts` - Main process entry
- `src/preload.ts` - Preload script
- `src/renderer/App.tsx` - React app entry
- `src/renderer/index.css` - Global styles

### Core Services
- `src/main/services/powerShellService.ts` - PowerShell execution
- `src/main/services/configService.ts` - Configuration
- `src/main/services/fileService.ts` - File operations
- `src/main/ipcHandlers.ts` - IPC handlers

### State Management
- `src/renderer/store/useProfileStore.ts` - Profiles
- `src/renderer/store/useTabStore.ts` - Tabs
- `src/renderer/store/useThemeStore.ts` - Theme
- `src/renderer/store/useMigrationStore.ts` - Migration
- `src/renderer/store/useDiscoveryStore.ts` - Discovery

---

## 🎨 UI Component Library

### Atoms (15 components)
- Button, Input, Select, Checkbox, Radio
- Switch, Badge, Avatar, Icon, Spinner
- Progress, Alert, Tooltip, Divider, Card

### Molecules (12 components)
- SearchBar, ProfileSelector, StatusIndicator
- DataGridToolbar, FilterPanel, ColumnSelector
- ExportMenu, Pagination, BreadcrumbNav
- ActionMenu, FormGroup, ChartLegend

### Organisms (10 components)
- Sidebar, TabView, DataGridWrapper
- VirtualizedDataGrid, Modal, CommandPalette
- NotificationCenter, ThemeToggle, NavigationMenu, DashboardGrid

---

## 🧪 Testing Guide

### Unit Test Structure
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByRole('button'));
    expect(/* assertion */).toBe(true);
  });
});
```

### E2E Test Structure
```typescript
import { test, expect } from '@playwright/test';

test('User Journey', async ({ page }) => {
  // Navigate
  await page.goto('/');

  // Interact
  await page.click('button');

  // Assert
  await expect(page.locator('...')).toBeVisible();
});
```

---

## 🐛 Common Issues & Solutions

### Issue: Build fails with TypeScript errors
**Solution:**
```bash
npm run type-check
# Fix type errors, then:
npm run build
```

### Issue: Tests fail with module not found
**Solution:**
```bash
# Clear Jest cache
npm run test:clear-cache
npm test
```

### Issue: Hot reload not working
**Solution:**
```bash
# Restart dev server
npm run clean
npm start
```

### Issue: PowerShell scripts not executing
**Solution:**
- Check script path in `../Scripts/`
- Verify execution policy: `Get-ExecutionPolicy`
- Check PowerShell service logs

### Issue: Bundle size too large
**Solution:**
```bash
# Analyze bundle
npm run analyze
# Review imports, enable code splitting
```

---

## 📖 Documentation Links

- [Architecture Guide](./docs/ARCHITECTURE.md) - System architecture
- [Developer Guide](./docs/DEVELOPER_GUIDE.md) - Development best practices
- [User Guide](./docs/USER_GUIDE.md) - End-user documentation
- [API Reference](./docs/API_REFERENCE.md) - API documentation
- [Migration Guide](./docs/MIGRATION_GUIDE.md) - Legacy migration
- [Deployment Guide](./docs/DEPLOYMENT.md) - Deployment instructions
- [Index](./docs/INDEX.md) - Documentation index

---

## 🔐 Security Considerations

### IPC Security
- ✅ Context isolation enabled
- ✅ Node integration disabled
- ✅ Preload script sandboxed
- ✅ All IPC channels validated

### Data Security
- ✅ Credentials encrypted at rest
- ✅ Secure token storage
- ✅ Input validation on all forms
- ✅ XSS protection enabled

### PowerShell Security
- ✅ Script path sanitization
- ✅ Execution policy enforcement
- ✅ Parameter validation
- ✅ Error isolation

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Run all tests: `npm test`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Check coverage: `npm run test:coverage`
- [ ] Build production: `npm run build`
- [ ] Analyze bundle: `npm run analyze`
- [ ] Type check: `npm run type-check`
- [ ] Lint code: `npm run lint`

### Deployment
- [ ] Create packages: `npm run make`
- [ ] Test installers on target OS
- [ ] Verify all features work
- [ ] Check performance metrics
- [ ] Review security settings
- [ ] Update documentation

### Post-deployment
- [ ] Monitor error logs
- [ ] Track performance metrics
- [ ] Gather user feedback
- [ ] Plan next iteration

---

## 🤝 Contributing Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier configured
- Tailwind CSS for all styling
- Atomic design pattern for components

### Git Workflow
1. Create feature branch
2. Make changes
3. Run tests
4. Commit with descriptive message
5. Push and create PR
6. Review and merge

### Commit Message Format
```
type(scope): description

Examples:
feat(discovery): add AWS discovery view
fix(migration): resolve rollback issue
docs(api): update PowerShell service docs
test(views): add unit tests for admin views
```

---

## 📞 Support & Resources

### Getting Help
- Documentation: `guiv2/docs/`
- Issue Tracker: GitHub Issues
- Developer Guide: `guiv2/docs/DEVELOPER_GUIDE.md`

### Useful Commands
```bash
# Clean build artifacts
npm run clean

# Reset to fresh state
npm run clean && npm install

# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

*Quick Reference Guide - M&A Discovery Suite GUI v2*
*For detailed information, see the comprehensive documentation in `guiv2/docs/`*
