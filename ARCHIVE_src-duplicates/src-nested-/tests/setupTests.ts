/**
 * Global Test Setup
 *
 * This file provides global mocks and configuration for all Jest tests.
 * It is automatically loaded before each test suite runs.
 */

import '@testing-library/jest-dom';

// ============================================================================
// Global Electron API Mock
// ============================================================================

const mockElectronAPI = {
  // Discovery APIs
  onProgress: jest.fn(),
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

  // Configuration APIs
  getConfig: jest.fn().mockResolvedValue({}),
  saveConfig: jest.fn().mockResolvedValue(undefined),

  // Logging APIs
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Set up global window object
(global as any).window = {
  ...global.window,
  electron: mockElectronAPI,
};

// ============================================================================
// Global Fetch Mock
// ============================================================================

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  statusText: 'OK',
  headers: new Headers(),
  json: jest.fn().mockResolvedValue({}),
  text: jest.fn().mockResolvedValue(''),
  blob: jest.fn().mockResolvedValue(new Blob()),
  arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
  formData: jest.fn().mockResolvedValue(new FormData()),
  clone: jest.fn(),
  body: null,
  bodyUsed: false,
  redirected: false,
  type: 'basic' as ResponseType,
  url: '',
}) as jest.Mock;

// ============================================================================
// Reset Mocks Before Each Test
// ============================================================================

beforeEach(() => {
  // Reset all Electron API mocks
  Object.values(mockElectronAPI).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  // Reset fetch mock
  if (jest.isMockFunction(global.fetch)) {
    (global.fetch as jest.Mock).mockClear();
  }
});

// ============================================================================
// Suppress Console Warnings in Tests
// ============================================================================

// Store original console methods
const originalError = console.error;
const originalWarn = console.warn;

// Suppress specific expected warnings
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Suppress known React/testing warnings
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
       args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
       args[0].includes('Error: Not implemented'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    // Suppress known deprecation warnings
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('ts-jest') ||
       args[0].includes('deprecated'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

// Restore console methods after all tests
afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// ============================================================================
// Mock Window APIs
// ============================================================================

// Mock matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver for virtualized lists
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver for responsive components
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// ============================================================================
// Export Mock References
// ============================================================================

export { mockElectronAPI };
