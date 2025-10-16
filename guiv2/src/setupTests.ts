// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import { configure } from '@testing-library/react';

// Configure testing-library to use data-cy as testid attribute
configure({ testIdAttribute: 'data-cy' });

// Register AG Grid modules for testing
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);

// Polyfills for Jest environment
const { TextEncoder, TextDecoder } = require('util');
Object.assign(globalThis, { TextEncoder, TextDecoder });

// Mock URL.createObjectURL for testing
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'mock-url'),
});

// Mock URL.revokeObjectURL for testing
Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock window.electronAPI for testing with comprehensive defaults
Object.defineProperty(window, 'alert', { writable: true, value: jest.fn() });

globalThis.window.electronAPI = {
  // Generic invoke/channel API used by views
  invoke: jest.fn(async (_channel: string, _payload?: any) => ({ success: true, data: {} })),

  // PowerShell/module execution APIs
  executeScript: jest.fn(async () => ({ success: true, data: '', error: null })),
  executeModule: jest.fn(async () => ({ success: true, data: {}, error: null })),
  cancelExecution: jest.fn(async () => ({ success: true })),

  // File system and dialogs
  readFile: jest.fn(async () => ''),
  writeFile: jest.fn(async () => undefined),
  showSaveDialog: jest.fn(async () => 'mock-output.csv'),

  // Config APIs
  getConfig: jest.fn(async (_key?: string) => ({})),
  setConfig: jest.fn(async (_key: string, _val: any) => true),

  // Streaming callbacks
  onProgress: jest.fn((cb?: (d: any) => void) => {
    // return unsubscribe
    return jest.fn();
  }),
  onOutput: jest.fn(() => jest.fn()),

  // Namespaced APIs used throughout the app
  logicEngine: {
    getStatistics: jest.fn(async () => ({ success: true, data: { statistics: {} } })),
    getUserDetail: jest.fn(async () => ({ success: true, data: { user: {} } })),
    invalidateCache: jest.fn(async () => ({ success: true })),
  },
  appRegistration: {
    hasCredentials: jest.fn(async () => true),
    readSummary: jest.fn(async () => ({ CredentialFile: 'cred.json' })),
    decryptCredential: jest.fn(async () => 'mock-secret'),
    launch: jest.fn(async () => ({ success: true })),
  },
  project: {
    getConfiguration: jest.fn(async () => ({ success: true, data: {} })),
    saveConfiguration: jest.fn(async () => ({ success: true })),
    updateStatus: jest.fn(async () => ({ success: true })),
    addWave: jest.fn(async () => ({ success: true })),
    updateWaveStatus: jest.fn(async () => ({ success: true })),
  },

  // Migration/discovery orchestrations
  planMigration: jest.fn(async () => ({ runId: 'mock-run-id' })),
  executeMigration: jest.fn(async () => ({ runId: 'mock-run-id' })),
  onMigrationProgress: jest.fn((_cb?: (d: any) => void) => jest.fn()),
  onMigrationResult: jest.fn((_cb?: (d: any) => void) => jest.fn()),

  startDiscovery: jest.fn(async () => ({ success: true, data: {} })),
  onDiscoveryProgress: jest.fn((_cb?: (d: any) => void) => jest.fn()),
  onDiscoveryResult: jest.fn((_cb?: (d: any) => void) => jest.fn()),
  onDiscoveryError: jest.fn((_cb?: (d: any) => void) => jest.fn()),
} as any;

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver implements globalThis.IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}

  observe(target: Element): void {}
  unobserve(target: Element): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};
