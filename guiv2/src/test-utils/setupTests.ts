/**
 * Jest setup file for GUIv2 tests
 * Configures test environment with necessary mocks and utilities
 */

// Add TextEncoder and TextDecoder FIRST before any imports
if (typeof global.TextEncoder === 'undefined') {
  const util = require('util');
  global.TextEncoder = util.TextEncoder as any;
  global.TextDecoder = util.TextDecoder as any;
}

import '@testing-library/jest-dom';
import './customMatchers'; // Load custom matchers
import { configure } from '@testing-library/react';
// Configure testing-library
// Use 'data-cy' as test ID attribute to match Cypress/component conventions
configure({
  testIdAttribute: 'data-cy',
  asyncUtilTimeout: 5000  
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock crypto.randomUUID for Node.js crypto module
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => '00000000-0000-0000-0000-000000000000',
    getRandomValues: (arr: any) => arr,
  },
});


// Add TextEncoder and TextDecoder for tests that need them (e.g., react-router-dom)
if (typeof global.TextEncoder === 'undefined') {
  const util = require('util');
  global.TextEncoder = util.TextEncoder as any;
  global.TextDecoder = util.TextDecoder as any;
}

// Mock AG Grid modules to prevent errors
jest.mock('ag-grid-community', () => ({
  ModuleRegistry: {
    registerModules: jest.fn(),
  },
  AllCommunityModule: {},
}));

jest.mock('ag-grid-react', () => ({
  AgGridReact: jest.fn().mockImplementation(() => null),
}));

// Mock AG Grid Enterprise to prevent "Class extends value undefined" errors
jest.mock('ag-grid-enterprise', () => ({
  __esModule: true,
  LicenseManager: {
    setLicenseKey: jest.fn(),
    isDisplayWatermark: jest.fn().mockReturnValue(false),
  },
  AllEnterpriseModule: {},
  // Add other enterprise modules as needed
  GridChartsModule: {},
  ServerSideRowModelModule: {},
  ExcelExportModule: {},
  MasterDetailModule: {},
  MenuModule: {},
  ColumnsToolPanelModule: {},
  FiltersToolPanelModule: {},
  RangeSelectionModule: {},
  RichSelectModule: {},
  RowGroupingModule: {},
  SetFilterModule: {},
  MultiFilterModule: {},
  StatusBarModule: {},
  SideBarModule: {},
  ClipboardModule: {},
  ViewportRowModelModule: {},
  SparklinesModule: {},
}));

// Mock react-dnd and react-dnd-html5-backend for drag-and-drop functionality
jest.mock('react-dnd', () => ({
  useDrag: jest.fn(() => [{ isDragging: false }, jest.fn(), jest.fn()]),
  useDrop: jest.fn(() => [{ isOver: false, canDrop: false }, jest.fn()]),
  DndProvider: ({ children }: any) => children,
}));

jest.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: {},
}));

// Mock Electron API
jest.mock('electron', () => ({
  ipcRenderer: {
    invoke: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    send: jest.fn(),
  },
}));

// Mock window.electronAPI for tests that expect it
const mockElectronAPI = {
  // Discovery APIs
  executeModule: jest.fn().mockResolvedValue({ success: true, data: {} }),
  cancelExecution: jest.fn().mockResolvedValue({ cancelled: true }),
  onProgress: jest.fn(),
  onDiscoveryProgress: jest.fn((callback) => {
    // Return unsubscribe function
    return jest.fn();
  }),
  onProfileChanged: jest.fn((callback) => {
    // Return unsubscribe function
    return jest.fn();
  }),
  exportToCsv: jest.fn().mockResolvedValue({ exported: true, path: '/mock/path' }),
  exportToExcel: jest.fn().mockResolvedValue({ exported: true, path: '/mock/path' }),
  startDiscovery: jest.fn().mockResolvedValue({ success: true, data: {} }),
  cancelDiscovery: jest.fn().mockResolvedValue({ cancelled: true }),
  exportResults: jest.fn().mockResolvedValue({ exported: true, path: '/mock/path' }),

  // File system APIs
  readFile: jest.fn().mockResolvedValue('mock file content'),
  writeFile: jest.fn().mockResolvedValue(undefined),
  showOpenDialog: jest.fn().mockResolvedValue({ filePaths: ['/mock/path'] }),
  showSaveDialog: jest.fn().mockResolvedValue({ filePath: '/mock/save/path' }),

  // Window management
  minimize: jest.fn(),
  maximize: jest.fn(),
  close: jest.fn(),

  
  // Additional Discovery event handlers
  onDiscoveryComplete: jest.fn((callback) => jest.fn()),
  onDiscoveryError: jest.fn((callback) => jest.fn()),
  onDiscoveryOutput: jest.fn((callback) => jest.fn()),

  // Discovery execution APIs
  executeDiscovery: jest.fn().mockResolvedValue({ success: true, executionId: 'test-exec-id' }),
  cancelDiscovery: jest.fn().mockResolvedValue({ cancelled: true }),

  // Profile management (flat structure for backward compatibility)
  getActiveProfile: jest.fn().mockResolvedValue({ id: 'test-profile', name: 'Test Profile' }),
  setActiveProfile: jest.fn().mockResolvedValue(undefined),
  listProfiles: jest.fn().mockResolvedValue([
    { id: 'test-profile', name: 'Test Profile' }
  ]),

  // Nested profile structure (some views use window.electron.profile.method)
  profile: {
    onProfileChanged: jest.fn((callback) => jest.fn()), // Returns unsubscribe function
    validate: jest.fn().mockResolvedValue({ valid: true, errors: [] }),
    getActiveProfile: jest.fn().mockResolvedValue({ id: 'test-profile', name: 'Test Profile' }),
    setActiveProfile: jest.fn().mockResolvedValue(undefined),
    listProfiles: jest.fn().mockResolvedValue([
      { id: 'test-profile', name: 'Test Profile' }
    ]),
  },
};

Object.defineProperty(window, 'electronAPI', {
  writable: true,
  value: mockElectronAPI,
});

// Also expose as window.electron for backward compatibility
Object.defineProperty(window, 'electron', {
  writable: true,
  value: mockElectronAPI,
});

// Mock fetch globally
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: jest.fn().mockResolvedValue({}),
  text: jest.fn().mockResolvedValue(''),
  blob: jest.fn().mockResolvedValue(new Blob()),
  arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
  headers: new Headers(),
}) as any;

// Reset mocks before each test
beforeEach(() => {
  Object.values(mockElectronAPI).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  if (jest.isMockFunction(global.fetch)) {
    (global.fetch as jest.Mock).mockClear();
  }
});

// Mock all services that might be imported - using absolute paths from root
jest.mock('src/renderer/services/loggingService', () => ({
  default: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('src/renderer/services/errorHandlingService', () => ({
  ErrorHandlingService: {
    getInstance: jest.fn().mockReturnValue({
      handleError: jest.fn(),
      logError: jest.fn(),
    }),
  },
}));

// Note: The following services are NOT mocked globally to allow direct testing:
// - cacheService, themeService, performanceMonitoringService, webhookService
// Individual tests should mock them if needed

// Silence console errors during tests unless explicitly testing for them
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Suppress AG Grid warnings and other expected errors in tests
    if (typeof args[0] === 'string' &&
        (args[0].includes('AG Grid') ||
         args[0].includes('Warning:') ||
         args[0].includes('ReactDOMTestUtils'))) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock setImmediate for browser environment (jsdom doesn't have it)
global.setImmediate = global.setImmediate || ((fn: any, ...args: any[]) => setTimeout(fn, 0, ...args)) as any;
global.clearImmediate = global.clearImmediate || ((id: any) => clearTimeout(id)) as any;

// Global test utilities
global.flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
  root = null;
  rootMargin = '';
  thresholds = [];
  takeRecords = jest.fn();
};

// Mock URL.createObjectURL
URL.createObjectURL = jest.fn(() => 'mock-url');
URL.revokeObjectURL = jest.fn();

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0) as any;
global.cancelAnimationFrame = (id: number) => clearTimeout(id);

// Suppress specific warnings in tests
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('ReactDOM.render') ||
     args[0].includes('componentWillReceiveProps') ||
     args[0].includes('componentWillMount'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};
// Mock React Router hooks globally to prevent "useHref() may be used only in the context of a <Router>" errors
// This allows tests to run without always wrapping in MemoryRouter
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: jest.fn(() => jest.fn()),
    useParams: jest.fn(() => ({})),
    useLocation: jest.fn(() => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default'
    })),
    useHref: jest.fn((to) => typeof to === 'string' ? to : '/'),
    useSearchParams: jest.fn(() => [new URLSearchParams(), jest.fn()]),
    useMatch: jest.fn(() => null),
    useRoutes: jest.fn(() => null),
    useOutlet: jest.fn(() => null),
    useOutletContext: jest.fn(() => ({})),
    useResolvedPath: jest.fn((to) => ({ pathname: typeof to === 'string' ? to : '/', search: '', hash: '' })),
    // Keep actual components for proper rendering in tests that use MemoryRouter
    MemoryRouter: actual.MemoryRouter,
    Routes: actual.Routes,
    Route: actual.Route,
    Link: actual.Link,
    Navigate: actual.Navigate,
    Outlet: actual.Outlet,
    BrowserRouter: actual.BrowserRouter,
    HashRouter: actual.HashRouter,
    Router: actual.Router,
  };
});
