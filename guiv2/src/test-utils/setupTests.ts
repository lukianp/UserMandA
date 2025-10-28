import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import 'jest-axe/extend-expect';

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000
});

// Mock AG Grid modules to avoid registration errors
jest.mock('ag-grid-community', () => ({
  ModuleRegistry: {
    registerModules: jest.fn(),
  },
  AllCommunityModule: {},
  AllEnterpriseModule: {},
  createGrid: jest.fn(),
  ColDef: {},
  GridApi: {},
  GridReadyEvent: {},
  SelectionChangedEvent: {},
  RowClickedEvent: {},
}));

// Mock ag-grid-enterprise
jest.mock('ag-grid-enterprise', () => ({}));

// Mock AG Grid React
jest.mock('ag-grid-react', () => ({
  AgGridReact: jest.fn().mockImplementation(() => null),
}));

// Mock URL.createObjectURL for jsdom
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'mock-object-url'),
});

// Mock Blob for jsdom
global.Blob = jest.fn().mockImplementation((content: any, options: any) => ({
  content,
  options,
  size: content ? content.length : 0,
  type: options?.type || '',
}));

// Setup window.electronAPI mock for all tests
const mockElectronAPI = {
  executeModule: jest.fn().mockResolvedValue({ success: true, data: {} }),
  executeScript: jest.fn().mockResolvedValue({ success: true, data: {} }),
  cancelExecution: jest.fn().mockResolvedValue({ success: true }),
  onProgress: jest.fn(() => jest.fn()),
  powershell: {
    executeScript: jest.fn(),
    executeModule: jest.fn(),
    cancel: jest.fn(),
  },
  config: {
    get: jest.fn(),
    set: jest.fn(),
  },
  system: {
    getSystemInfo: jest.fn(),
  },
};

// Ensure window.electronAPI is available
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'electronAPI', {
    writable: true,
    value: mockElectronAPI,
  });
}

// Also set on global for compatibility
(global as any).electronAPI = mockElectronAPI;

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();

  // Reset mock implementations
  mockElectronAPI.executeModule.mockResolvedValue({ success: true, data: {} });
  mockElectronAPI.executeScript.mockResolvedValue({ success: true, data: {} });
  mockElectronAPI.cancelExecution.mockResolvedValue({ success: true });
  mockElectronAPI.onProgress.mockReturnValue(jest.fn());
});

// Suppress console errors in tests unless explicitly needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
