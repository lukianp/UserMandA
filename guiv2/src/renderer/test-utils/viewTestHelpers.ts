/**
 * Test Utilities for View Components
 * Provides common mocks, helpers, and utilities for testing all views
 */

import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';

// ============================================================================
// Mock Data Factories
// ============================================================================

export const mockDiscoveryData = () => ({
  users: [
    { id: '1', name: 'John Doe', email: 'john@example.com', department: 'IT' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', department: 'HR' },
  ],
  groups: [
    { id: '1', name: 'Administrators', memberCount: 5 },
    { id: '2', name: 'Users', memberCount: 100 },
  ],
  computers: [
    { id: '1', name: 'WKS-001', os: 'Windows 11', status: 'Online' },
    { id: '2', name: 'WKS-002', os: 'Windows 10', status: 'Offline' },
  ],
});

export const mockMigrationData = () => ({
  waves: [
    { id: '1', name: 'Wave 1', userCount: 50, status: 'Pending' },
    { id: '2', name: 'Wave 2', userCount: 75, status: 'In Progress' },
  ],
  mappings: [
    { sourceId: '1', targetId: '101', status: 'Mapped' },
    { sourceId: '2', targetId: '102', status: 'Unmapped' },
  ],
  validationResults: [
    { id: '1', type: 'Error', message: 'Invalid user mapping' },
    { id: '2', type: 'Warning', message: 'Duplicate group detected' },
  ],
});

export const mockAnalyticsData = () => ({
  kpis: [
    { label: 'Total Users', value: 1250, change: 5.2 },
    { label: 'Active Users', value: 980, change: -2.1 },
    { label: 'Total Groups', value: 45, change: 0 },
  ],
  chartData: [
    { date: '2025-01-01', users: 100, groups: 10 },
    { date: '2025-02-01', users: 150, groups: 12 },
    { date: '2025-03-01', users: 200, groups: 15 },
  ],
  costAnalysis: [
    { category: 'Licenses', cost: 50000 },
    { category: 'Migration', cost: 25000 },
    { category: 'Training', cost: 10000 },
  ],
});

export const mockProfileData = () => ({
  id: 'profile-1',
  name: 'Test Profile',
  type: 'source',
  domain: 'contoso.com',
  credentials: {
    username: 'admin',
    password: '***',
  },
  connectionStatus: 'connected',
});

export const mockProgressData = () => ({
  current: 50,
  total: 100,
  percentage: 50,
  status: 'In Progress',
  message: 'Processing users...',
});

export const mockErrorData = () => ({
  code: 'ERR_001',
  message: 'An error occurred during discovery',
  details: 'Connection timeout',
  timestamp: new Date().toISOString(),
});

export const mockLogData = () => [
  { timestamp: '2025-01-01T10:00:00', level: 'info', message: 'Discovery started' },
  { timestamp: '2025-01-01T10:01:00', level: 'warning', message: 'Some users skipped' },
  { timestamp: '2025-01-01T10:02:00', level: 'error', message: 'Connection failed' },
];

// ============================================================================
// Mock IPC API Responses
// ============================================================================

export const mockSuccessfulExecution = (data: any) => {
  (window.electronAPI.executeScript as jest.Mock).mockResolvedValue({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const mockFailedExecution = (error: string) => {
  (window.electronAPI.executeScript as jest.Mock).mockRejectedValue(
    new Error(error)
  );
};

export const mockProgressUpdates = (updates: any[]) => {
  let currentIndex = 0;
  (window.electronAPI.onProgress as jest.Mock).mockImplementation((callback) => {
    const interval = setInterval(() => {
      if (currentIndex < updates.length) {
        callback(updates[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  });
};

export const mockOutputLogs = (logs: string[]) => {
  let currentIndex = 0;
  (window.electronAPI.onOutput as jest.Mock).mockImplementation((callback) => {
    const interval = setInterval(() => {
      if (currentIndex < logs.length) {
        callback(logs[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  });
};

// ============================================================================
// Render Helpers
// ============================================================================

/**
 * Custom render that wraps components with necessary providers
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // For now, just render without providers since views don't need them
  // This can be extended if views need Router or other providers
  return render(ui, options);
};

/**
 * Wait for async data to load
 */
export const waitForDataLoad = async (timeout = 1000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

/**
 * Simulate user typing with delay
 */
export const typeIntoInput = async (
  input: HTMLElement,
  text: string,
  delay = 50
) => {
  const { fireEvent } = await import('@testing-library/react');
  for (let i = 0; i < text.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    fireEvent.change(input, { target: { value: text.slice(0, i + 1) } });
  }
};

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Check if element has loading state
 */
export const hasLoadingState = (container: HTMLElement): boolean => {
  return (
    container.querySelector('[role="status"]') !== null ||
    container.querySelector('[data-loading="true"]') !== null ||
    container.textContent?.includes('Loading') === true
  );
};

/**
 * Check if element has error state
 */
export const hasErrorState = (container: HTMLElement): boolean => {
  return (
    container.querySelector('[role="alert"]') !== null ||
    container.querySelector('[data-error="true"]') !== null ||
    container.textContent?.includes('error') === true ||
    container.textContent?.includes('Error') === true
  );
};

/**
 * Check if element has empty state
 */
export const hasEmptyState = (container: HTMLElement): boolean => {
  return (
    container.textContent?.includes('No data') === true ||
    container.textContent?.includes('No results') === true ||
    container.textContent?.includes('empty') === true
  );
};

// ============================================================================
// Mock Store Helpers
// ============================================================================

/**
 * Reset all mocks between tests
 */
export const resetAllMocks = () => {
  jest.clearAllMocks();

  // Reset window.electronAPI mocks
  (window.electronAPI.executeScript as jest.Mock).mockReset();
  (window.electronAPI.executeModule as jest.Mock).mockReset();
  (window.electronAPI.cancelExecution as jest.Mock).mockReset();
  (window.electronAPI.readFile as jest.Mock).mockReset();
  (window.electronAPI.writeFile as jest.Mock).mockReset();
  (window.electronAPI.getConfig as jest.Mock).mockReset();
  (window.electronAPI.setConfig as jest.Mock).mockReset();
  (window.electronAPI.onProgress as jest.Mock).mockReset();
  (window.electronAPI.onOutput as jest.Mock).mockReset();
};

// ============================================================================
// Test Data Generators
// ============================================================================

/**
 * Generate mock users
 */
export const generateMockUsers = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    department: i % 2 === 0 ? 'IT' : 'HR',
    status: i % 3 === 0 ? 'Active' : 'Inactive',
  }));
};

/**
 * Generate mock groups
 */
export const generateMockGroups = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `group-${i + 1}`,
    name: `Group ${i + 1}`,
    memberCount: Math.floor(Math.random() * 100),
    type: i % 2 === 0 ? 'Security' : 'Distribution',
  }));
};

/**
 * Generate mock computers
 */
export const generateMockComputers = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `computer-${i + 1}`,
    name: `WKS-${String(i + 1).padStart(3, '0')}`,
    os: i % 2 === 0 ? 'Windows 11' : 'Windows 10',
    status: i % 3 === 0 ? 'Online' : 'Offline',
  }));
};

// ============================================================================
// Common Test Scenarios
// ============================================================================

/**
 * Test rendering without crashing
 */
export const testComponentRenders = (Component: React.FC) => {
  const { container } = renderWithProviders(<Component />);
  expect(container).toBeInTheDocument();
};

/**
 * Test loading state
 */
export const testLoadingState = async (Component: React.FC) => {
  mockSuccessfulExecution(mockDiscoveryData());
  const { container } = renderWithProviders(<Component />);

  // Should show loading state initially
  if (hasLoadingState(container)) {
    return true;
  }

  return false;
};

/**
 * Test error state
 */
export const testErrorState = async (Component: React.FC, errorMessage: string) => {
  mockFailedExecution(errorMessage);
  const { container } = renderWithProviders(<Component />);

  // Wait for error to appear
  await waitForDataLoad(500);

  return hasErrorState(container);
};

/**
 * Test data display
 */
export const testDataDisplay = async (Component: React.FC, expectedData: any) => {
  mockSuccessfulExecution(expectedData);
  const { container } = renderWithProviders(<Component />);

  // Wait for data to load
  await waitForDataLoad(500);

  return container;
};
